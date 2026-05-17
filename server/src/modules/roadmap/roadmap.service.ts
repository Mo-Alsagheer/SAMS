import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRoadmapDto } from './dto/create-roadmap.dto';
import { UpdateRoadmapDto } from './dto/update-roadmap.dto';
import { Roadmap } from './entities/roadmap.entity';

@Injectable()
export class RoadmapService {
  constructor(
    @InjectRepository(Roadmap)
    private readonly roadmapRepo: Repository<Roadmap>,
  ) {}

  create(createRoadmapDto: CreateRoadmapDto): Promise<Roadmap> {
    if (createRoadmapDto.directorId == null) {
      throw new BadRequestException('directorId is required');
    }

    if (!createRoadmapDto.title?.trim()) {
      throw new BadRequestException('title is required');
    }

    const roadmap = this.roadmapRepo.create({
      directorId: createRoadmapDto.directorId,
      committeeId: null,
      title: createRoadmapDto.title,
      description: createRoadmapDto.description ?? null,
    });
    return this.roadmapRepo.save(roadmap);
  }

  findAll(): Promise<Roadmap[]> {
    return this.roadmapRepo.find();
  }

  async findOne(id: number): Promise<Roadmap> {
    const roadmap = await this.roadmapRepo.findOne({ where: { id } });
    if (!roadmap) throw new NotFoundException('Roadmap not found');
    return roadmap;
  }

  async findByCommitteeId(committeeId: number): Promise<Roadmap> {
    const roadmap = await this.roadmapRepo.findOne({ where: { committeeId } });
    if (!roadmap) throw new NotFoundException('Roadmap not found');
    return roadmap;
  }

  async update(
    id: number,
    updateRoadmapDto: UpdateRoadmapDto,
  ): Promise<Roadmap> {
    const roadmap = await this.findOne(id);
    Object.assign(roadmap, {
      ...(updateRoadmapDto.title !== undefined && {
        title: updateRoadmapDto.title,
      }),
      ...(updateRoadmapDto.description !== undefined && {
        description: updateRoadmapDto.description,
      }),
      ...(updateRoadmapDto.committeeId !== undefined && {
        committeeId: updateRoadmapDto.committeeId,
      }),
    });
    return this.roadmapRepo.save(roadmap);
  }

  async assignCommittee(id: number, committeeId: number): Promise<Roadmap> {
    const roadmap = await this.findOne(id);
    roadmap.committeeId = committeeId;
    return this.roadmapRepo.save(roadmap);
  }

  async unassignCommittee(id: number): Promise<Roadmap> {
    const roadmap = await this.findOne(id);
    roadmap.committeeId = null;
    return this.roadmapRepo.save(roadmap);
  }

  async updateByCommitteeId(
    committeeId: number,
    updateRoadmapDto: UpdateRoadmapDto,
  ): Promise<Roadmap> {
    const roadmap = await this.roadmapRepo.findOne({ where: { committeeId } });
    if (!roadmap) throw new NotFoundException('Roadmap not found');

    Object.assign(roadmap, {
      ...(updateRoadmapDto.title !== undefined && {
        title: updateRoadmapDto.title,
      }),
      ...(updateRoadmapDto.description !== undefined && {
        description: updateRoadmapDto.description,
      }),
      committeeId,
    });

    return this.roadmapRepo.save(roadmap);
  }

  async remove(id: number): Promise<void> {
    const roadmap = await this.findOne(id);
    await this.roadmapRepo.remove(roadmap);
  }
}
