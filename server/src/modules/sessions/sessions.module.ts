import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from './entities/session.entity';
import { Material } from '../materials/entities/material.entity';
import { Task } from '../tasks/entities/task.entity';
import { TaskSubmission } from '../tasks/entities/task-submission.entity';
import { Attendace } from '../attendace/entities/attendace.entity';
import { Committee } from '../committees/entities/committee.entity';
import { User } from '../users/entities/user.entity';
import { SessionsController } from './sessions.controller';
import { MemberDashboardController } from './member-dashboard.controller';
import { SessionsService } from './sessions.service';
import { MeetingsModule } from '../meetings/meetings.module';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { RoadmapModule } from '../roadmap/roadmap.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Session,
      Material,
      Task,
      TaskSubmission,
      Attendace,
      Committee,
      User,
    ]),
    MeetingsModule,
    AuditLogModule,
    RoadmapModule,
  ],
  controllers: [SessionsController, MemberDashboardController],
  providers: [SessionsService],
  exports: [SessionsService],
})
export class SessionsModule {}
