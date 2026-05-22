import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Material } from './entities/material.entity';
import { SessionsService } from '../sessions/sessions.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class MaterialsService {
  constructor(
    @InjectRepository(Material)
    private readonly materialRepo: Repository<Material>,
    private readonly sessionsService: SessionsService,
    private readonly audit: AuditLogService,
  ) {}

  async createForSession(
    sessionId: number,
    dto: CreateMaterialDto,
    fileUrl: string | undefined,
    directorId: number,
  ): Promise<Material> {
    await this.sessionsService.findById(sessionId);

    const finalFileUrl = fileUrl || dto.fileUrl;
    if (!finalFileUrl) {
      throw new BadRequestException('A file upload or fileUrl is required');
    }

    const material = this.materialRepo.create({
      sessionId,
      title: dto.title,
      fileUrl: finalFileUrl,
      uploadedBy: directorId,
    });

    this.audit
      .log({
        action: 'MaterialsService.createForSession',
        userId: String(directorId),
        body: { sessionId, title: dto.title, fileUrl: finalFileUrl },
      })
      .catch(() => undefined);

    return this.materialRepo.save(material);
  }

  async findBySession(sessionId: number): Promise<Material[]> {
    await this.sessionsService.findById(sessionId);
    return this.materialRepo.find({
      where: { sessionId },
      order: { createdAt: 'ASC' },
    });
  }

  async findByCommittee(committeeId: number): Promise<Material[]> {
    return this.materialRepo
      .createQueryBuilder('material')
      .innerJoin('material.session', 'session')
      .innerJoin('roadmaps', 'roadmap', 'roadmap.id = session.roadmapId')
      .where('roadmap.committeeId = :committeeId', { committeeId })
      .orderBy('material.createdAt', 'ASC')
      .getMany();
  }

  async remove(materialId: number, directorId: number): Promise<void> {
    const material = await this.materialRepo.findOne({
      where: { id: materialId },
    });
    if (!material) {
      throw new NotFoundException('Material not found');
    }

    this.audit
      .log({
        action: 'MaterialsService.remove',
        userId: String(directorId),
        body: { materialId, title: material.title },
      })
      .catch(() => undefined);

    await this.materialRepo.remove(material);
  }
}
