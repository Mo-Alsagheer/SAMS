import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  RecruitmentProcess,
  RecruitmentStatus,
} from './entities/recruitment.entity';
import { Committee } from '../committees/entities/committee.entity';

@Injectable()
export class RecruitmentService {
  constructor(
    @InjectRepository(RecruitmentProcess)
    private recruitmentRepository: Repository<RecruitmentProcess>,
    @InjectRepository(Committee)
    private committeeRepository: Repository<Committee>,
  ) {}

  async openProcess(executiveId: string, committeeId: string, targetMembers: number) {
    const committee = await this.committeeRepository.findOne({
      where: { id: committeeId },
    });
    if (!committee) {
      throw new NotFoundException('Committee not found');
    }

    let process = await this.recruitmentRepository.findOne({
      where: { committeeId },
    });

    if (process) {
      if (process.status === RecruitmentStatus.OPEN) {
        throw new BadRequestException(
          'Recruitment process is already OPEN for this committee',
        );
      }
      process.status = RecruitmentStatus.OPEN;
      process.openedAt = new Date();
      process.targetMembers = targetMembers;
    } else {
      process = this.recruitmentRepository.create({
        committeeId,
        createdBy: executiveId,
        status: RecruitmentStatus.OPEN,
        openedAt: new Date(),
        targetMembers,
      });
    }

    return this.recruitmentRepository.save(process);
  }

  async closeProcess(committeeId: string) {
    const process = await this.recruitmentRepository.findOne({
      where: { committeeId },
    });
    if (!process) {
      throw new NotFoundException(
        'Recruitment process not found for this committee',
      );
    }

    if (process.status === RecruitmentStatus.CLOSED) {
      throw new BadRequestException('Recruitment process is already CLOSED');
    }

    process.status = RecruitmentStatus.CLOSED;
    process.closedAt = new Date();
    return this.recruitmentRepository.save(process);
  }

  async findAll() {
    return this.recruitmentRepository.find();
  }
}
