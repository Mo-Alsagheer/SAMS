import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ExecutiveController } from './executive.controller';
import { ExecutiveService } from './executive.service';
import { User } from '../users/entities/user.entity';
import { Application } from '../applications/entities/application.entity';
import { EmailModule } from '../email/email.module';
import { RecruitmentProcess } from '../recruitment/entities/recruitment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Application, RecruitmentProcess]),
    ConfigModule,
    EmailModule,
  ],
  controllers: [ExecutiveController],
  providers: [ExecutiveService],
})
export class ExecutiveModule {}
