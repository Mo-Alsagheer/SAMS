import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, IsNull } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { Role } from '../../common/constants/role.enum';
import {
  Application,
  ApplicationStatus,
} from '../applications/entities/application.entity';
import { EmailService } from '../email/email.service';
import {
  RecruitmentProcess,
  RecruitmentStatus,
} from '../recruitment/entities/recruitment.entity';
import { Committee } from '../committees/entities/committee.entity';
import { AiService } from '../../integrations/ai-service/ai.service';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class ExecutiveService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(RecruitmentProcess)
    private recruitmentRepository: Repository<RecruitmentProcess>,
    @InjectRepository(Committee)
    private committeeRepository: Repository<Committee>,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
    private readonly aiService: AiService,
    private readonly audit: AuditLogService,
  ) { }

  async getDirectorsByCommittee(committeeId: number): Promise<User[]> {
    return this.userRepository.find({
      where: {
        committeeId: committeeId,
        role: Role.DIRECTOR,
      },
      select: [
        'id',
        'name',
        'email',
        'phone',
        'university',
        'faculty',
        'academicLevel',
        'role',
        'status',
      ],
    });
  }

  async getMembersByCommittee(committeeId: number): Promise<User[]> {
    return this.userRepository.find({
      where: {
        committeeId: committeeId,
        role: Role.MEMBER,
      },
      select: [
        'id',
        'name',
        'email',
        'phone',
        'university',
        'faculty',
        'academicLevel',
        'role',
        'status',
      ],
    });
  }

  async getApplications(committeeId?: number, status?: string) {
    const query = this.applicationRepository.createQueryBuilder('application');

    if (committeeId) {
      query
        .where('application.committeeId = :committeeId', { committeeId })
        .andWhere('application.targetRole = :targetRole', {
          targetRole: Role.DIRECTOR,
        });
    } else {
      query
        .where('application.committeeId IS NULL')
        .andWhere('application.targetRole = :targetRole', {
          targetRole: Role.EXECUTIVE,
        });
    }

    if (status) {
      query.andWhere('application.status = :status', { status });
    }

    const applications = await query.getMany();

    if (applications.length === 0) {
      return applications;
    }

    // Fetch all relevant committees
    const committeeIds = [
      ...new Set(applications.map((app) => app.committeeId).filter((id) => id)),
    ];
    let committeeMap = new Map();
    if (committeeIds.length > 0) {
      const committees = await this.committeeRepository.findBy({
        id: In(committeeIds as number[]),
      });
      committeeMap = new Map(committees.map((c) => [c.id, c]));
    }

    const cvsToEvaluate = applications
      .filter((app) => app.cvLink)
      .map((app) => {
        const committee = app.committeeId
          ? committeeMap.get(app.committeeId)
          : null;
        return {
          id: app.id,
          type: 'gdrive',
          link: app.cvLink,
          committee_name: committee ? committee.name : 'General',
          committee_focus: committee?.description
            ? committee.description
            : 'General community operations',
        };
      });

    if (cvsToEvaluate.length > 0) {
      try {
        const evaluationResponse =
          await this.aiService.evaluateBatchApplications({
            cvs: cvsToEvaluate,
          });

        const aiResultsMap = new Map();
        if (evaluationResponse && evaluationResponse.results) {
          for (const res of evaluationResponse.results) {
            aiResultsMap.set(res.id, res);
          }
        }

        return applications.map((app) => {
          const aiScore = aiResultsMap.get(app.id);
          return {
            ...app,
            aiScore: aiScore || null,
          };
        });
      } catch (error) {
        console.log(error);
        return applications;
      }
    }

    return applications;
  }

  async acceptPhase1(applicationId: number) {
    const application = await this.applicationRepository.findOne({
      where: {
        id: applicationId,
        targetRole: In([Role.DIRECTOR, Role.EXECUTIVE]),
      },
    });
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    application.status = ApplicationStatus.PHASE1_ACCEPTED;
    return this.applicationRepository.save(application);
  }

  async rejectPhase1(applicationId: number) {
    const application = await this.applicationRepository.findOne({
      where: {
        id: applicationId,
        targetRole: In([Role.DIRECTOR, Role.EXECUTIVE]),
      },
    });
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    application.status = ApplicationStatus.PHASE1_REJECTED;
    return this.applicationRepository.save(application);
  }

  async scheduleInterview(applicationId: number, payload: any) {
    const application = await this.applicationRepository.findOne({
      where: { id: applicationId },
    });
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    application.status = ApplicationStatus.INTERVIEW_SCHEDULED;
    await this.applicationRepository.save(application);
    return { ...application, ...payload };
  }

  async acceptPhase2(applicationId: number) {
    const application = await this.applicationRepository.findOne({
      where: {
        id: applicationId,
      },
    });
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // --- Quota check ---
    // For EXECUTIVE applications committeeId is null; for DIRECTOR it is set.
    const recruitmentWhere =
      application.targetRole === Role.EXECUTIVE
        ? {
          role: Role.EXECUTIVE,
          committeeId: IsNull(),
          status: RecruitmentStatus.OPEN,
        }
        : {
          role: Role.DIRECTOR,
          committeeId: application.committeeId,
          status: RecruitmentStatus.OPEN,
        };

    const recruitment = await this.recruitmentRepository.findOne({
      where: recruitmentWhere,
    });

    if (recruitment && recruitment.targetMembers > 0) {
      const acceptedCount = await this.applicationRepository.count({
        where: {
          targetRole: application.targetRole,
          status: ApplicationStatus.PHASE2_ACCEPTED,
          ...(application.targetRole === Role.EXECUTIVE
            ? { committeeId: null }
            : { committeeId: application.committeeId }),
        },
      });

      if (acceptedCount >= recruitment.targetMembers) {
        const roleLabel =
          application.targetRole === Role.EXECUTIVE ? 'executive' : 'director';
        throw new BadRequestException(
          `Recruitment quota reached: this recruitment already has ${acceptedCount} accepted ${roleLabel}(s) out of a target of ${recruitment.targetMembers}.`,
        );
      }
    }

    application.status = ApplicationStatus.PHASE2_ACCEPTED;
    await this.applicationRepository.save(application);

    // Generate a random temporary password
    const plainPassword = this.generatePassword();
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Determine the role label for the email
    const roleLabel =
      application.targetRole === Role.EXECUTIVE ? 'Executive' : 'Director';

    // Check if a User account already exists
    let user = await this.userRepository.findOne({
      where: { email: application.email },
    });
    if (user) {
      user.name = application.name;
      user.phone = application.phone;
      user.password = hashedPassword;
      user.role = application.targetRole;
      user.committeeId = application.committeeId ?? null;
    } else {
      user = this.userRepository.create({
        name: application.name,
        email: application.email,
        phone: application.phone,
        password: hashedPassword,
        role: application.targetRole,
        committeeId: application.committeeId ?? null,
      });
    }
    await this.userRepository.save(user);

    // Send welcome email with credentials
    const loginUrl =
      this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:5173';
    await this.emailService.sendWelcomeEmail({
      to: application.email,
      name: application.name,
      role: roleLabel,
      password: plainPassword,
      loginUrl,
    });

    return application;
  }

  async rejectPhase2(applicationId: number) {
    const application = await this.applicationRepository.findOne({
      where: {
        id: applicationId,
        targetRole: In([Role.DIRECTOR, Role.EXECUTIVE]),
      },
    });
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    application.status = ApplicationStatus.PHASE2_REJECTED;
    return this.applicationRepository.save(application);
  }

  private generatePassword(length = 12): string {
    const chars =
      'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
}
