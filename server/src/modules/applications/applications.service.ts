import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, In } from 'typeorm';
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
    this.audit
      .log({ action: 'ApplicationsService.createApplication', body: { dto } })
      .catch(() => undefined);

    const process = await this.recruitmentProcessRepository.findOne({
      where: { id: dto.processId },
    });
    if (!process || process.status !== RecruitmentStatus.OPEN) {
      throw new BadRequestException(
        'Recruitment process is not OPEN',
      );
    }

    // Check if user already applied by email
    const existing = await this.applicationRepository.findOne({
      where: {
        email: dto.email,
        processId: dto.processId,
      },
    });
    if (existing) {
      throw new ConflictException(
        'An application with this email has already been submitted for this recruitment process',
      );
    }

    const application = this.applicationRepository.create({
      processId: dto.processId,
      committeeId: process.committeeId,
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      linkedinLink: dto.linkedinLink,
      cvLink: dto.cvLink,
      status: ApplicationStatus.SUBMITTED,
      targetRole: process.role,
      title: process.title,
    });

    return this.applicationRepository.save(application);
  }

  async findOne(id: number) {
    this.audit
      .log({ action: 'ApplicationsService.findOne', body: { id } })
      .catch(() => undefined);
    const application = await this.applicationRepository.findOne({
      where: { id },
    });
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    let committee = null;
    if (application.committeeId) {
      committee = await this.committeeRepository.findOne({
        where: { id: application.committeeId },
      });
    }

    if (!application.cvLink) {
      return { ...application, aiScore: null };
    }

    try {
      const evaluationResponse = await this.aiService.evaluateApplication({
        id: application.id,
        type: 'gdrive',
        link: application.cvLink,
        committee_name: committee ? committee.name : 'General',
        committee_focus: committee?.description
          ? committee.description
          : 'General community operations',
      });

      return {
        ...application,
        aiScore: evaluationResponse || null,
      };
    } catch (error) {
      console.log(error);
      return {
        ...application,
        aiScore: null,
      };
    }
  }

  async evaluatePendingApplications() {
    this.audit
      .log({ action: 'ApplicationsService.evaluatePendingApplications' })
      .catch(() => undefined);
    const applications = await this.applicationRepository.find({
      where: { status: ApplicationStatus.SUBMITTED },
    });

    // Fetch all relevant committees
    const committeeIds = [
      ...new Set(applications.map((app) => app.committeeId).filter((id) => id)),
    ];
    const committees = await this.committeeRepository.findBy({
      id: In(committeeIds as number[]),
    });
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

  async evaluatePendingApplicationsForProcess(processId: number) {
    this.audit
      .log({ action: 'ApplicationsService.evaluatePendingApplicationsForProcess', body: { processId } })
      .catch(() => undefined);

    const process = await this.recruitmentProcessRepository.findOne({
      where: { id: processId },
    });
    if (!process) {
      throw new NotFoundException('Recruitment process not found');
    }

    const applications = await this.applicationRepository.find({
      where: {
        processId: processId,
        status: ApplicationStatus.SUBMITTED,
      },
    });

    let committee = null;
    if (process.committeeId) {
      committee = await this.committeeRepository.findOne({
        where: { id: process.committeeId },
      });
    }

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

    if (cvsToEvaluate.length === 0) {
      return {
        message: 'No applications pending evaluation with a valid CV link for this recruitment process.',
        results: [],
      };
    }

    return this.aiService.evaluateBatchApplications({ cvs: cvsToEvaluate });
  }
}
