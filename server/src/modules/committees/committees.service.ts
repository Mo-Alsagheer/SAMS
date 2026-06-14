import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCommitteeDto } from './dto/create-committee.dto';
import { UpdateCommitteeDto } from './dto/update-committee.dto';
import { UpdateCommitteeByDirectorDto } from './dto/update-committee-by-director.dto';
import { Committee } from './entities/committee.entity';
import { AuditLogService } from '../audit-log/audit-log.service';
import {
  RecruitmentProcess,
  RecruitmentStatus,
} from '../recruitment/entities/recruitment.entity';
import { User } from '../users/entities/user.entity';
import { Role } from '../../common/constants/role.enum';

@Injectable()
export class CommitteesService {
  constructor(
    @InjectRepository(Committee)
    private readonly committeesRepo: Repository<Committee>,
    @InjectRepository(RecruitmentProcess)
    private readonly recruitmentRepo: Repository<RecruitmentProcess>,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    private readonly audit: AuditLogService,
  ) {}

  listAll(): Promise<Committee[]> {
    return this.committeesRepo.find();
  }

  async getById(id: number): Promise<Committee> {
    const committee = await this.committeesRepo.findOne({ where: { id } });
    if (!committee) {
      throw new NotFoundException('Committee not found');
    }
    return committee;
  }

  create(
    dto: CreateCommitteeDto,
    createdBy: number,
    imageUrl?: string,
  ): Promise<Committee> {
    this.audit
      .log({ action: 'CommitteesService.create', body: { dto, createdBy } })
      .catch(() => undefined);
    const committee = this.committeesRepo.create({
      name: dto.name,
      description: dto.description ?? null,
      type: dto.type,
      planID: dto.planID ?? null,
      directorIDs: dto.directorIDs ?? [],
      membersCount: dto.membersCount ?? 0,
      whatsappGroupLink: dto.whatsappGroupLink ?? null,
      imageUrl: imageUrl ?? null,
      createdBy,
    });
    return this.committeesRepo.save(committee);
  }

  async update(
    id: number,
    dto: UpdateCommitteeDto | UpdateCommitteeByDirectorDto,
    imageUrl?: string,
  ): Promise<Committee> {
    const committee = await this.getById(id);
    Object.assign(committee, {
      ...('name' in dto && dto.name !== undefined && { name: dto.name }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...('type' in dto && dto.type !== undefined && { type: dto.type }),
      ...('planID' in dto &&
        dto.planID !== undefined && { planID: dto.planID }),
      ...('directorIDs' in dto &&
        dto.directorIDs !== undefined && { directorIDs: dto.directorIDs }),
      ...('membersCount' in dto &&
        dto.membersCount !== undefined && { membersCount: dto.membersCount }),
      ...(dto.whatsappGroupLink !== undefined && {
        whatsappGroupLink: dto.whatsappGroupLink,
      }),
      ...(imageUrl !== undefined && { imageUrl }),
    });
    return this.committeesRepo.save(committee);
  }

  async assignDirector(
    committeeId: number,
    userId: number,
  ): Promise<Committee> {
    const committee = await this.getById(committeeId);
    const user = await this.usersRepo.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // If user is currently assigned to another committee, remove them from it
    if (user.committeeId && user.committeeId !== committeeId) {
      const oldCommittee = await this.committeesRepo.findOne({
        where: { id: user.committeeId },
      });
      if (oldCommittee && oldCommittee.directorIDs) {
        oldCommittee.directorIDs = oldCommittee.directorIDs.filter(
          (id) => id !== userId,
        );
        await this.committeesRepo.save(oldCommittee);
      }
    }

    // Update user role and committee
    user.role = Role.DIRECTOR;
    user.committeeId = committeeId;
    await this.usersRepo.save(user);

    // Add to new committee's directorIDs if not already there
    if (!committee.directorIDs) {
      committee.directorIDs = [];
    }
    if (!committee.directorIDs.includes(userId)) {
      committee.directorIDs.push(userId);
      await this.committeesRepo.save(committee);
    }

    this.audit
      .log({
        action: 'CommitteesService.assignDirector',
        body: { committeeId, userId },
      })
      .catch(() => undefined);

    return committee;
  }

  async updateDescription(id: number, description: string): Promise<Committee> {
    const committee = await this.getById(id);
    committee.description = description;
    return this.committeesRepo.save(committee);
  }

  async delete(id: number): Promise<void> {
    const committee = await this.getById(id);

    const openRecruitment = await this.recruitmentRepo.findOne({
      where: {
        committeeId: id,
        status: RecruitmentStatus.OPEN,
      },
    });

    if (openRecruitment) {
      throw new BadRequestException(
        'Cannot delete committee with an open recruitment process',
      );
    }
    this.audit
      .log({ action: 'CommitteesService.delete', body: { id } })
      .catch(() => undefined);
    await this.committeesRepo.remove(committee);
  }
}
