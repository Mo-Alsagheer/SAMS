import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Role } from '../../common/constants/role.enum';
import { Application, ApplicationStatus } from './entities/application.entity';
import {
  RecruitmentProcess,
  RecruitmentStatus,
} from '../recruitment/entities/recruitment.entity';
import { Committee } from '../committees/entities/committee.entity';
import { CreateApplicationDto } from './dto/create-application.dto';
import { AiService } from '../../integrations/ai-service/ai.service';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(RecruitmentProcess)
    private recruitmentProcessRepository: Repository<RecruitmentProcess>,
    @InjectRepository(Committee)
    private committeeRepository: Repository<Committee>,
    private aiService: AiService,
    private readonly audit: AuditLogService,
  ) {}

  async createApplication(dto: CreateApplicationDto) {
    this.audit.log({ action: 'ApplicationsService.createApplication', body: { dto } }).catch(() => undefined);
    if (dto.targetRole === Role.EXECUTIVE) {
      if (dto.committeeId) {
        throw new BadRequestException(
          'Executive applications cannot target a specific committee',
        );
      }
    } else {
      if (!dto.committeeId) {
        throw new BadRequestException('Committee ID is required for this role');
      }
    }

    const committeeIdCondition = dto.committeeId ? dto.committeeId : IsNull();

    // Verify committee recruitment is OPEN
    const process = await this.recruitmentProcessRepository.findOne({
      where: { committeeId: committeeIdCondition, role: dto.targetRole },
    });
    if (!process || process.status !== RecruitmentStatus.OPEN) {
      throw new BadRequestException(
        'Recruitment process for this role (and committee) is not OPEN',
      );
    }

    // Check if user already applied by email
    const existing = await this.applicationRepository.findOne({
      where: {
        email: dto.email,
        committeeId: committeeIdCondition,
        targetRole: dto.targetRole,
      },
    });
    if (existing) {
      throw new ConflictException(
        'An application with this email has already been submitted for the specified role',
      );
    }

    const application = this.applicationRepository.create({
      committeeId: dto.committeeId || null,
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      linkedinLink: dto.linkedinLink,
      cvLink: dto.cvLink,
      status: ApplicationStatus.SUBMITTED,
      targetRole: dto.targetRole,
    });

    return this.applicationRepository.save(application);
  }

  async findOne(id: string) {
    this.audit.log({ action: 'ApplicationsService.findOne', body: { id } }).catch(() => undefined);
    const application = await this.applicationRepository.findOne({
      where: { id },
    });
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    return application;
  }

  async evaluatePendingApplications() {
    this.audit.log({ action: 'ApplicationsService.evaluatePendingApplications' }).catch(() => undefined);
    const applications = await this.applicationRepository.find({
      where: { status: ApplicationStatus.SUBMITTED },
    });

    // Fetch all relevant committees
    const committeeIds = [
      ...new Set(applications.map((app) => app.committeeId).filter((id) => id)),
    ];
    const committees = await this.committeeRepository.findByIds(committeeIds);
    const committeeMap = new Map(committees.map((c) => [c.id, c]));

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

    if (cvsToEvaluate.length === 0) {
      return {
        message: 'No applications pending evaluation with a valid CV link.',
        results: [],
      };
    }

    return this.aiService.evaluateBatchApplications({ cvs: cvsToEvaluate });
  }
}
