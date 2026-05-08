import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { Application } from './entities/application.entity';
import { RecruitmentProcess } from '../recruitment/entities/recruitment.entity';
import { Committee } from '../committees/entities/committee.entity';
import { AiModule } from '../../integrations/ai-service/ai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Application, RecruitmentProcess, Committee]),
    AiModule,
  ],
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
})
export class ApplicationsModule {}
