import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendace } from './entities/attendace.entity';
import { AttendaceService } from './attendace.service';
import { AttendaceController } from './attendace.controller';
import { Session } from '../sessions/entities/session.entity';
import { User } from '../users/entities/user.entity';
import { TaskSubmission } from '../tasks/entities/task-submission.entity';
import { Committee } from '../committees/entities/committee.entity';
import { RoadmapModule } from '../roadmap/roadmap.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Attendace,
      Session,
      User,
      TaskSubmission,
      Committee,
    ]),
    RoadmapModule,
  ],
  controllers: [AttendaceController],
  providers: [AttendaceService],
  exports: [AttendaceService],
})
export class AttendaceModule {}
