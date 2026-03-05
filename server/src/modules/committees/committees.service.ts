import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCommitteeDto } from './dto/create-committee.dto';
import { UpdateCommitteeDto } from './dto/update-committee.dto';
import { Committee } from './entities/committee.entity';

@Injectable()
export class CommitteesService {
  constructor(
    @InjectRepository(Committee)
    private readonly committeesRepo: Repository<Committee>,
  ) {}

  listAll(): Promise<Committee[]> {
    return this.committeesRepo.find();
  }

  async getById(id: string): Promise<Committee> {
    const committee = await this.committeesRepo.findOne({ where: { id } });
    if (!committee) {
      throw new NotFoundException('Committee not found');
    }
    return committee;
  }

  create(dto: CreateCommitteeDto, createdBy: string): Promise<Committee> {
    const committee = this.committeesRepo.create({
      name: dto.name,
      description: dto.description ?? null,
      type: dto.type,
      planID: dto.planID ?? null,
      directorIDs: dto.directorIDs ?? [],
      membersCount: dto.membersCount ?? 0,
      whatsappGroupLink: dto.whatsappGroupLink ?? null,
      createdBy,
    });
    return this.committeesRepo.save(committee);
  }

  async update(id: string, dto: UpdateCommitteeDto): Promise<Committee> {
    const committee = await this.getById(id);
    Object.assign(committee, {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.type !== undefined && { type: dto.type }),
      ...(dto.planID !== undefined && { planID: dto.planID }),
      ...(dto.directorIDs !== undefined && { directorIDs: dto.directorIDs }),
      ...(dto.membersCount !== undefined && { membersCount: dto.membersCount }),
      ...(dto.whatsappGroupLink !== undefined && {
        whatsappGroupLink: dto.whatsappGroupLink,
      }),
    });
    return this.committeesRepo.save(committee);
  }

  async updateDescription(id: string, description: string): Promise<Committee> {
    const committee = await this.getById(id);
    committee.description = description;
    return this.committeesRepo.save(committee);
  }

  async delete(id: string): Promise<void> {
    const committee = await this.getById(id);
    await this.committeesRepo.remove(committee);
  }
}
