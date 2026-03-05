import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecruitmentService } from './recruitment.service';
import { RecruitmentController } from './recruitment.controller';
import { RecruitmentProcess } from './entities/recruitment.entity';
import { Committee } from '../committees/entities/committee.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RecruitmentProcess, Committee])],
  controllers: [RecruitmentController],
  providers: [RecruitmentService],
})
export class RecruitmentModule {}
