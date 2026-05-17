import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommitteesController } from './committees.controller';
import { CommitteesService } from './committees.service';
import { Committee } from './entities/committee.entity';
import { RecruitmentProcess } from '../recruitment/entities/recruitment.entity';
import { CloudinaryModule } from '../../integrations/cloudinary/cloudinary.module';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Committee, RecruitmentProcess]),
    CloudinaryModule,
    AuditLogModule,
  ],
  controllers: [CommitteesController],
  providers: [CommitteesService],
  exports: [CommitteesService],
})
export class CommitteesModule { }
