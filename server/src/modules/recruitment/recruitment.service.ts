import { OpenRecruitmentDto } from './dto/open-recruitment.dto';
import {
  Injectable,

  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import {
  RecruitmentProcess,
  RecruitmentStatus,
} from './entities/recruitment.entity';
import { Committee } from '../committees/entities/committee.entity';
import { Role } from '../../common/constants/role.enum';

@Injectable()
export class RecruitmentService {
  constructor(
    @InjectRepository(RecruitmentProcess)
    private recruitmentRepository: Repository<RecruitmentProcess>,
    @InjectRepository(Committee)
    private committeeRepository: Repository<Committee>,
  ) {}

  async openProcess(executiveId: string, committeeId: string, dto: OpenRecruitmentDto) {
    if (dto.role === Role.EXECUTIVE) {
      throw new BadRequestException(
        'Committee recruitment processes can only be for MEMBER or DIRECTOR roles',
      );
    }
    const committee = await this.committeeRepository.findOne({
      where: { id: committeeId },
    });
    if (!committee) {
      throw new NotFoundException('Committee not found');
    }

    let process = await this.recruitmentRepository.findOne({
      where: { committeeId, role: dto.role },
    });

    if (process) {
      if (process.status === RecruitmentStatus.OPEN) {
        throw new BadRequestException(
          'Recruitment process is already OPEN for this committee and role',
        );
      }
      process.status = RecruitmentStatus.OPEN;
      process.openedAt = new Date();
      process.targetMembers = dto.targetMembers;
    } else {
      process = this.recruitmentRepository.create({
        committeeId,
        createdBy: executiveId,
        status: RecruitmentStatus.OPEN,
        openedAt: new Date(),
        targetMembers: dto.targetMembers,
        role: dto.role,
      });
    }

    return this.recruitmentRepository.save(process);
  }

  async openGlobalProcess(executiveId: string, dto: OpenRecruitmentDto) {
    if (dto.role !== Role.EXECUTIVE) {
      throw new BadRequestException('Global recruitment processes must be for the EXECUTIVE role');
    }

    let process = await this.recruitmentRepository.findOne({
      where: { role: dto.role, committeeId: IsNull() },
    });

    if (process) {
      if (process.status === RecruitmentStatus.OPEN) {
        throw new BadRequestException('Recruitment process is already OPEN globally for this role');
      }
      process.status = RecruitmentStatus.OPEN;
      process.openedAt = new Date();
      process.targetMembers = dto.targetMembers;
    } else {
      process = this.recruitmentRepository.create({
        committeeId: null,
        createdBy: executiveId,
        status: RecruitmentStatus.OPEN,
        openedAt: new Date(),
        targetMembers: dto.targetMembers,
        role: dto.role,
      });
    }

    return this.recruitmentRepository.save(process);
  }

  async closeProcess(id: string) {
    const process = await this.recruitmentRepository.findOne({
      where: { id },
    });
    if (!process) {
      throw new NotFoundException(
        'Recruitment process not found',
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
