import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application, ApplicationStatus } from '../applications/entities/application.entity';
import { Role } from '../../common/constants/role.enum';

@Injectable()
export class DirectorService {
  constructor(
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
  ) {}

  async getApplications(committeeId: string, status?: string) {
    const query = this.applicationRepository.createQueryBuilder('application')
      .where('application.committeeId = :committeeId', { committeeId })
      .andWhere('application.targetRole = :targetRole', { targetRole: Role.MEMBER });

    if (status) {
      query.andWhere('application.status = :status', { status });
    }

    return query.getMany();
  }

  async acceptPhase1(applicationId: string) {
    const application = await this.applicationRepository.findOne({ where: { id: applicationId, targetRole: Role.MEMBER } });
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    application.status = ApplicationStatus.PHASE1_ACCEPTED;
    return this.applicationRepository.save(application);
  }

  async rejectPhase1(applicationId: string) {
    const application = await this.applicationRepository.findOne({ where: { id: applicationId, targetRole: Role.MEMBER } });
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    application.status = ApplicationStatus.PHASE1_REJECTED;
    return this.applicationRepository.save(application);
  }

  async scheduleInterview(applicationId: string, payload: any) {
    const application = await this.applicationRepository.findOne({ where: { id: applicationId, targetRole: Role.MEMBER } });
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    application.status = ApplicationStatus.INTERVIEW_SCHEDULED;
    await this.applicationRepository.save(application);
    return { ...application, ...payload };
  }

  async acceptPhase2(applicationId: string) {
    const application = await this.applicationRepository.findOne({ where: { id: applicationId, targetRole: Role.MEMBER } });
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    application.status = ApplicationStatus.PHASE2_ACCEPTED;
    return this.applicationRepository.save(application);
  }

  async rejectPhase2(applicationId: string) {
    const application = await this.applicationRepository.findOne({ where: { id: applicationId, targetRole: Role.MEMBER } });
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    application.status = ApplicationStatus.PHASE2_REJECTED;
    return this.applicationRepository.save(application);
  }
}
