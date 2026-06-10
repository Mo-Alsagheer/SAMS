import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import {
  Application,
  ApplicationStatus,
} from '../applications/entities/application.entity';
import { User } from '../users/entities/user.entity';
import { Role } from '../../common/constants/role.enum';
import { EmailService } from '../email/email.service';
import {
  RecruitmentProcess,
  RecruitmentStatus,
} from '../recruitment/entities/recruitment.entity';
import { Committee } from '../committees/entities/committee.entity';
import { AiService } from '../../integrations/ai-service/ai.service';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class DirectorService {
  constructor(
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(RecruitmentProcess)
    private recruitmentRepository: Repository<RecruitmentProcess>,
    @InjectRepository(Committee)
    private committeeRepository: Repository<Committee>,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
    private readonly aiService: AiService,
    private readonly audit: AuditLogService,
  ) {}

  async getApplications(committeeId: number, status?: string) {
    const query = this.applicationRepository
      .createQueryBuilder('application')
      .leftJoinAndSelect('application.process', 'process')
      .where('process.committeeId = :committeeId', { committeeId })
      .andWhere('application.targetRole = :targetRole', {
        targetRole: Role.MEMBER,
      });

    if (status) {
      query.andWhere('application.status = :status', { status });
    }

    const applications = await query.getMany();

    if (applications.length === 0) {
      return applications;
    }

    const committee = await this.committeeRepository.findOne({
      where: { id: committeeId },
    });

    const cvsToEvaluate = applications
      .filter((app) => app.cvLink)
      .map((app) => ({
        id: app.id,
        type: 'gdrive',
        link: app.cvLink,
        committee_name: committee ? committee.name : 'General',
        committee_focus: committee?.description
          ? committee.description
          : 'General community operations',
      }));

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
        // If AI service fails, return applications without scores gracefully
        console.log(error);
        return applications;
      }
    }

    return applications;
  }

  async acceptPhase1(applicationId: number) {
    const application = await this.applicationRepository.findOne({
      where: { id: applicationId, targetRole: Role.MEMBER },
    });
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    application.status = ApplicationStatus.PHASE1_ACCEPTED;
    return this.applicationRepository.save(application);
  }

  async rejectPhase1(applicationId: number) {
    const application = await this.applicationRepository.findOne({
      where: { id: applicationId, targetRole: Role.MEMBER },
    });
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    application.status = ApplicationStatus.PHASE1_REJECTED;
    return this.applicationRepository.save(application);
  }

  async scheduleInterview(applicationId: number, payload: any) {
    const application = await this.applicationRepository.findOne({
      where: { id: applicationId, targetRole: Role.MEMBER },
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
      where: { id: applicationId, targetRole: Role.MEMBER },
      relations: ['process'],
    });
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // --- Quota check ---
    const recruitment = await this.recruitmentRepository.findOne({
      where: {
        committeeId: application.process.committeeId,
        role: Role.MEMBER,
        status: RecruitmentStatus.OPEN,
      },
    });

    if (recruitment && recruitment.targetMembers > 0) {
      const acceptedCount = await this.applicationRepository.count({
        where: {
          processId: application.processId,
          status: ApplicationStatus.PHASE2_ACCEPTED,
        },
      });

      if (acceptedCount >= recruitment.targetMembers) {
        throw new BadRequestException(
          `Recruitment quota reached: this committee already has ${acceptedCount} accepted member(s) out of a target of ${recruitment.targetMembers}.`,
        );
      }
    }

    application.status = ApplicationStatus.PHASE2_ACCEPTED;
    await this.applicationRepository.save(application);

    let user = await this.userRepository.findOne({
      where: { email: application.email },
    });

    const password = this.generatePassword();
    const hashedPassword = await bcrypt.hash(password, 10);

    if (user) {
      user.role = Role.MEMBER;
      user.committeeId = application.process.committeeId;
      user.password = hashedPassword;
      await this.userRepository.save(user);
    } else {
      user = this.userRepository.create({
        name: application.name,
        email: application.email,
        phone: application.phone,
        password: hashedPassword,
        role: Role.MEMBER,
        committeeId: application.process.committeeId,
      });
      await this.userRepository.save(user);
    }

    const loginUrl =
      this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:5173';
    await this.emailService.sendWelcomeEmail({
      to: application.email,
      name: application.name,
      role: 'Member',
      password,
      loginUrl,
    });

    return application;
  }

  async rejectPhase2(applicationId: number) {
    const application = await this.applicationRepository.findOne({
      where: { id: applicationId, targetRole: Role.MEMBER },
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
