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
} from '../recruitment/entities/recruitment.entity';import { CreateApplicationDto } from './dto/create-application.dto';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(RecruitmentProcess)
    private recruitmentProcessRepository: Repository<RecruitmentProcess>,
  ) {}

  async createApplication(dto: CreateApplicationDto) {
    // Verify committee recruitment is OPEN
    const process = await this.recruitmentProcessRepository.findOne({
      where: { committeeId: dto.committeeId },
    });
    if (!process || process.status !== RecruitmentStatus.OPEN) {
      throw new BadRequestException(
        'Recruitment process for this committee is not OPEN',
      );
    }

    // Check if user already applied by email
    const existing = await this.applicationRepository.findOne({
      where: { email: dto.email, committeeId: dto.committeeId },
    });
    if (existing) {
      throw new ConflictException('An application with this email has already been submitted to this committee');
    }

    const application = this.applicationRepository.create({
      committeeId: dto.committeeId,
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      linkedinLink: dto.linkedinLink,
      cvLink: dto.cvLink,
      status: ApplicationStatus.SUBMITTED,
    });

    return this.applicationRepository.save(application);
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
