import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { TaskSubmission } from './entities/task-submission.entity';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { DirectorTasksController } from './director-tasks.controller';
import { SessionsModule } from '../sessions/sessions.module';
import { CloudinaryModule } from '../../integrations/cloudinary/cloudinary.module';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, TaskSubmission]),
    SessionsModule,
    CloudinaryModule,
    AuditLogModule,
    UsersModule,
  ],
  controllers: [TasksController, DirectorTasksController],
  providers: [TasksService],
  exports: [TasksService, TypeOrmModule],
})
export class TasksModule {}
