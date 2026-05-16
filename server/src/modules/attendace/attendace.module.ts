import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendace } from './entities/attendace.entity';
import { AttendaceService } from './attendace.service';
import { Session } from '../sessions/entities/session.entity';
import { Roadmap } from '../sessions/entities/roadmap.entity';
import { User } from '../users/entities/user.entity';
import { TaskSubmission } from '../tasks/entities/task-submission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Attendace,
      Session,
      Roadmap,
      User,
      TaskSubmission,
    ]),
  ],
  providers: [AttendaceService],
  exports: [AttendaceService],
})
export class AttendaceModule {}
