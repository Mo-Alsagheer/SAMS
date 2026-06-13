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
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class RecruitmentService {
  constructor(
    @InjectRepository(RecruitmentProcess)
    private recruitmentRepository: Repository<RecruitmentProcess>,
    @InjectRepository(Committee)
    private committeeRepository: Repository<Committee>,
    private readonly audit: AuditLogService,
  ) {}

  async openProcess(
    executiveId: number,
    committeeId: number,
    dto: OpenRecruitmentDto,
  ) {
    this.audit
      .log({
        action: 'RecruitmentService.openProcess',
        body: { executiveId, committeeId, dto },
      })
      .catch(() => undefined);
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
      process.status = RecruitmentStatus.OPEN;
      process.openedAt = new Date();
      process.closedAt = null;
      process.targetMembers = dto.targetMembers;
    } else {
      process = this.recruitmentRepository.create({
        committeeId,
        createdBy: executiveId,
        status: RecruitmentStatus.OPEN,
        openedAt: new Date(),
        closedAt: null,
        targetMembers: dto.targetMembers,
        role: dto.role,
      });
    }

    return this.recruitmentRepository.save(process);
  }

  async openGlobalProcess(executiveId: number, dto: OpenRecruitmentDto) {
    if (dto.role !== Role.EXECUTIVE) {
      throw new BadRequestException(
        'Global recruitment processes must be for the EXECUTIVE role',
      );
    }

    let process = await this.recruitmentRepository.findOne({
      where: { role: dto.role, committeeId: IsNull() },
    });

    if (process) {
      process.status = RecruitmentStatus.OPEN;
      process.openedAt = new Date();
      process.closedAt = null;
      process.targetMembers = dto.targetMembers;
    } else {
      process = this.recruitmentRepository.create({
        committeeId: null,
        createdBy: executiveId,
        status: RecruitmentStatus.OPEN,
        openedAt: new Date(),
        closedAt: null,
        targetMembers: dto.targetMembers,
        role: dto.role,
      });
    }

    return this.recruitmentRepository.save(process);
  }

  async closeProcess(id: number) {
    const process = await this.recruitmentRepository.findOne({
      where: { id },
    });
    if (!process) {
      throw new NotFoundException('Recruitment process not found');
    }

    if (process.status === RecruitmentStatus.CLOSED) {
      throw new BadRequestException('Recruitment process is already CLOSED');
    }

    process.status = RecruitmentStatus.CLOSED;
    process.closedAt = new Date();
    return this.recruitmentRepository.save(process);
  }

  async findAll() {
    this.audit
      .log({ action: 'RecruitmentService.findAll' })
      .catch(() => undefined);
    return this.recruitmentRepository.find();
  }

  async getStatusByCommittee(committeeId: number, role?: Role) {
    const committee = await this.committeeRepository.findOne({
      where: { id: committeeId },
    });
    if (!committee) {
      throw new NotFoundException('Committee not found');
    }

    const whereClause: any = { committeeId };
    if (role) {
      whereClause.role = role;
    }

    const processes = await this.recruitmentRepository.find({
      where: whereClause,
      order: { openedAt: 'DESC' },
    });

    if (processes.length === 0) {
      return {
        committeeId,
        committeeName: committee.name,
        isOpen: false,
        status: RecruitmentStatus.CLOSED,
        processes: [],
      };
    }

    const isOpen = processes.some((p) => p.status === RecruitmentStatus.OPEN);

    return {
      committeeId,
      committeeName: committee.name,
      isOpen,
      status: isOpen ? RecruitmentStatus.OPEN : RecruitmentStatus.CLOSED,
      processes: processes.map((p) => ({
        id: p.id,
        role: p.role,
        status: p.status,
        targetMembers: p.targetMembers,
        openedAt: p.openedAt,
        closedAt: p.closedAt,
      })),
    };
  }
}
