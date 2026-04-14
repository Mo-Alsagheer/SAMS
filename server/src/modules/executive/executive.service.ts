import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Role } from '../../common/constants/role.enum';

import { Application, ApplicationStatus } from '../applications/entities/application.entity';

@Injectable()
export class ExecutiveService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
  ) {}

  async getDirectorsByCommittee(committeeId: string): Promise<User[]> {
    return this.userRepository.find({
      where: {
        committeeId: committeeId,
        role: Role.DIRECTOR,
      },
      select: ['id', 'name', 'email', 'phone', 'university', 'faculty', 'academicLevel', 'role', 'status']
    });
  }

  async getMembersByCommittee(committeeId: string): Promise<User[]> {
    return this.userRepository.find({
      where: {
        committeeId: committeeId,
        role: Role.MEMBER,
      },
      select: ['id', 'name', 'email', 'phone', 'university', 'faculty', 'academicLevel', 'role', 'status']
    });
  }

  async getApplications(committeeId?: string, status?: string) {
    const query = this.applicationRepository.createQueryBuilder('application');

    if (committeeId) {
      query.where('application.committeeId = :committeeId', { committeeId })
           .andWhere('application.targetRole = :targetRole', { targetRole: Role.DIRECTOR });
    } else {
      query.where('application.committeeId IS NULL')
           .andWhere('application.targetRole = :targetRole', { targetRole: Role.EXECUTIVE });
    }

    if (status) {
      query.andWhere('application.status = :status', { status });
    }

    return query.getMany();
  }

  async acceptPhase1(applicationId: string) {
    const application = await this.applicationRepository.findOne({ where: { id: applicationId, targetRole: In([Role.DIRECTOR, Role.EXECUTIVE]) } });
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    application.status = ApplicationStatus.PHASE1_ACCEPTED;
    return this.applicationRepository.save(application);
  }

  async rejectPhase1(applicationId: string) {
    const application = await this.applicationRepository.findOne({ where: { id: applicationId, targetRole: In([Role.DIRECTOR, Role.EXECUTIVE]) } });
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    application.status = ApplicationStatus.PHASE1_REJECTED;
    return this.applicationRepository.save(application);
  }

  async scheduleInterview(applicationId: string, payload: any) {
    const application = await this.applicationRepository.findOne({ where: { id: applicationId, targetRole: In([Role.DIRECTOR, Role.EXECUTIVE]) } });
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    application.status = ApplicationStatus.INTERVIEW_SCHEDULED;
    await this.applicationRepository.save(application);
    return { ...application, ...payload };
  }

  async acceptPhase2(applicationId: string) {
    const application = await this.applicationRepository.findOne({ where: { id: applicationId, targetRole: In([Role.DIRECTOR, Role.EXECUTIVE]) } });
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    application.status = ApplicationStatus.PHASE2_ACCEPTED;
    return this.applicationRepository.save(application);
  }

  async rejectPhase2(applicationId: string) {
    const application = await this.applicationRepository.findOne({ where: { id: applicationId, targetRole: In([Role.DIRECTOR, Role.EXECUTIVE]) } });
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    application.status = ApplicationStatus.PHASE2_REJECTED;
    return this.applicationRepository.save(application);
  }
}
