import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommitteesController } from './committees.controller';
import { CommitteesService } from './committees.service';
import { Committee } from './entities/committee.entity';
import { RecruitmentProcess } from '../recruitment/entities/recruitment.entity';
import { CloudinaryModule } from '../../integrations/cloudinary/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Committee, RecruitmentProcess]),
    CloudinaryModule,
  ],
  controllers: [CommitteesController],
  providers: [CommitteesService],
  exports: [CommitteesService],
})
export class CommitteesModule {}
