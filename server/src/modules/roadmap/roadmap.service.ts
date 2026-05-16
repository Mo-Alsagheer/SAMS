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

  /**
   * Creates a new roadmap for a director.
   * Purpose: store roadmap content with its creator, then allow committee assignment later.
   */
  create(createRoadmapDto: CreateRoadmapDto): Promise<Roadmap> {
    if (!createRoadmapDto.directorId?.trim()) {
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

  /**
   * Returns every roadmap in the system.
   * Purpose: support list views and admin/overview pages.
   */
  findAll(): Promise<Roadmap[]> {
    return this.roadmapRepo.find();
  }

  /**
   * Finds one roadmap by its numeric id.
   * Purpose: fetch a single roadmap for viewing or editing.
   */
  async findOne(id: number): Promise<Roadmap> {
    const roadmap = await this.roadmapRepo.findOne({ where: { id } });
    if (!roadmap) throw new NotFoundException('Roadmap not found');
    return roadmap;
  }

  /**
   * Finds the roadmap assigned to a committee.
   * Purpose: power the public committee roadmap view endpoint.
   */
  async findByCommitteeId(committeeId: string): Promise<Roadmap> {
    const roadmap = await this.roadmapRepo.findOne({ where: { committeeId } });
    if (!roadmap) throw new NotFoundException('Roadmap not found');
    return roadmap;
  }

  /**
   * Updates a roadmap by numeric id.
   * Purpose: allow direct edits to an existing roadmap record.
   */
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

  /**
   * Assigns a committee to a roadmap by roadmap id.
   * Purpose: re-link an existing roadmap to a different committee.
   */
  async assignCommittee(id: number, committeeId: string): Promise<Roadmap> {
    const roadmap = await this.findOne(id);
    roadmap.committeeId = committeeId;
    return this.roadmapRepo.save(roadmap);
  }

  /**
   * Unassigns any committee from a roadmap by roadmap id.
   * Purpose: keep the roadmap record but remove committee ownership.
   */
  async unassignCommittee(id: number): Promise<Roadmap> {
    const roadmap = await this.findOne(id);
    roadmap.committeeId = null;
    return this.roadmapRepo.save(roadmap);
  }

  /**
   * Updates the roadmap belonging to a specific committee.
   * Purpose: support committee-scoped roadmap edits without requiring the roadmap id.
   */
  async updateByCommitteeId(
    committeeId: string,
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

  /**
   * Removes a roadmap by numeric id.
   * Purpose: delete an unused roadmap record.
   */
  async remove(id: number): Promise<void> {
    const roadmap = await this.findOne(id);
    await this.roadmapRepo.remove(roadmap);
  }
}
