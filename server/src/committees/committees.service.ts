import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateCommitteeDto } from './dto/create-committee.dto';
import { UpdateCommitteeDto } from './dto/update-committee.dto';
import { Committee } from './committees.types';

@Injectable()
export class CommitteesService {
  private committees: Committee[] = [];

  listAll(): Committee[] {
    return [...this.committees];
  }

  getById(id: string): Committee {
    const committee = this.committees.find((item) => item.id === id);
    if (!committee) {
      throw new NotFoundException('Committee not found');
    }
    return committee;
  }

  create(dto: CreateCommitteeDto, createdBy: string): Committee {
    const committee: Committee = {
      id: randomUUID(),
      name: dto.name,
      description: dto.description ?? '',
      createdBy,
      directorId: dto.directorId ?? null,
      isOpen: dto.isOpen ?? true,
      createdAt: new Date().toISOString(),
    };

    this.committees.push(committee);
    return committee;
  }

  update(id: string, dto: UpdateCommitteeDto): Committee {
    const committee = this.getById(id);
    const updated: Committee = {
      ...committee,
      name: dto.name ?? committee.name,
      description: dto.description ?? committee.description,
      directorId: dto.directorId ?? committee.directorId,
      isOpen: dto.isOpen ?? committee.isOpen,
    };

    const index = this.committees.findIndex((item) => item.id === id);
    this.committees[index] = updated;
    return updated;
  }

  updateDescription(id: string, description: string): Committee {
    const committee = this.getById(id);
    const updated: Committee = {
      ...committee,
      description,
    };

    const index = this.committees.findIndex((item) => item.id === id);
    this.committees[index] = updated;
    return updated;
  }
}
