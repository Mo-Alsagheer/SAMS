import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Committee } from '../committees/entities/committee.entity';
import { Attendace } from '../attendace/entities/attendace.entity';
import { Session } from '../sessions/entities/session.entity';
import { Task } from '../tasks/entities/task.entity';
import { TaskSubmission } from '../tasks/entities/task-submission.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { AttendaceModule } from '../attendace/attendace.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Committee, Attendace, Session, Task, TaskSubmission]),
    AuditLogModule,
    AttendaceModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
