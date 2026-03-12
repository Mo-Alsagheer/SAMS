import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application, ApplicationStatus } from './entities/application.entity';
import {
  RecruitmentProcess,
  RecruitmentStatus,
} from '../recruitment/entities/recruitment.entity';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(RecruitmentProcess)
    private recruitmentProcessRepository: Repository<RecruitmentProcess>,
  ) {}

  async createDraft(userId: string, committeeId: string) {
    // Verify committee recruitment is OPEN
    const process = await this.recruitmentProcessRepository.findOne({
      where: { committeeId },
    });
    if (!process || process.status !== RecruitmentStatus.OPEN) {
      throw new BadRequestException(
        'Recruitment process for this committee is not OPEN',
      );
    }

    // Check if user already applied
    const existing = await this.applicationRepository.findOne({
      where: { userId, committeeId },
    });
    if (existing) {
      throw new ConflictException('You have already applied to this committee');
    }

    const application = this.applicationRepository.create({
      userId,
      committeeId,
      status: ApplicationStatus.DRAFT,
      name: '', // Mock or extract from user profile later
      email: '',
      phone: '',
    });

    return this.applicationRepository.save(application);
  }

  async updateDraft(id: string, updateData: any) {
    const application = await this.findOne(id);
    if (application.status !== ApplicationStatus.DRAFT) {
      throw new BadRequestException('Can only update DRAFT applications');
    }

    Object.assign(application, updateData);
    return this.applicationRepository.save(application);
  }

  async submit(id: string) {
    const application = await this.findOne(id);
    if (application.status !== ApplicationStatus.DRAFT) {
      throw new BadRequestException('Application is not in DRAFT status');
    }

    application.status = ApplicationStatus.SUBMITTED;
    application.submittedAt = new Date();
    return this.applicationRepository.save(application);
  }

  async findByUserId(userId: string) {
    return this.applicationRepository.find({ where: { userId } });
  }

  async findOne(id: string) {
    const application = await this.applicationRepository.findOne({
      where: { id },
    });
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    return application;
  }
}
