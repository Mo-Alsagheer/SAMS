import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { Application } from './entities/application.entity';
import { RecruitmentProcess } from '../recruitment/entities/recruitment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Application, RecruitmentProcess])],
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
})
export class ApplicationsModule {}
