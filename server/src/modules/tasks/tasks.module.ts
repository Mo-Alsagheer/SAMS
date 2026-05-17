import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { TaskSubmission } from './entities/task-submission.entity';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { DirectorTasksController } from './director-tasks.controller';
import { SessionsModule } from '../sessions/sessions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, TaskSubmission]),
    SessionsModule,
  ],
  controllers: [TasksController, DirectorTasksController],
  providers: [TasksService],
  exports: [TasksService, TypeOrmModule],
})
export class TasksModule {}
