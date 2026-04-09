import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommitteesController } from './committees.controller';
import { CommitteesService } from './committees.service';
import { Committee } from './entities/committee.entity';
import { RecruitmentProcess } from '../recruitment/entities/recruitment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Committee, RecruitmentProcess])],
  controllers: [CommitteesController],
  providers: [CommitteesService],
  exports: [CommitteesService],
})
export class CommitteesModule {}
