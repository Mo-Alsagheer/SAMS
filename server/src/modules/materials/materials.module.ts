import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Material } from './entities/material.entity';
import { MaterialsService } from './materials.service';
import { MaterialsController } from './materials.controller';
import { SessionsModule } from '../sessions/sessions.module';
import { CloudinaryModule } from '../../integrations/cloudinary/cloudinary.module';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Material]),
    SessionsModule,
    CloudinaryModule,
    AuditLogModule,
  ],
  controllers: [MaterialsController],
  providers: [MaterialsService],
  exports: [MaterialsService],
})
export class MaterialsModule {}
