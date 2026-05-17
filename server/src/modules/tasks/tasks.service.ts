import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { TaskSubmission } from './entities/task-submission.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { SubmitTaskDto } from './dto/submit-task.dto';
import { SessionsService } from '../sessions/sessions.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
    @InjectRepository(TaskSubmission)
    private readonly submissionRepo: Repository<TaskSubmission>,
    private readonly sessionsService: SessionsService,
  ) {}

  async createForSession(sessionId: number, dto: CreateTaskDto): Promise<Task> {
    await this.sessionsService.findById(sessionId);

    const task = this.taskRepo.create({
      sessionId,
      title: dto.title,
      description: dto.description ?? null,
      dueDate: new Date(dto.dueDate),
    });
    return this.taskRepo.save(task);
  }

  async findBySession(sessionId: number): Promise<Task[]> {
    await this.sessionsService.findById(sessionId);
    return this.taskRepo.find({
      where: { sessionId },
      order: { dueDate: 'ASC' },
    });
  }

  async findById(taskId: number): Promise<Task> {
    const task = await this.taskRepo.findOne({ where: { id: taskId } });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }

  async submit(
    taskId: number,
    userId: number,
    dto: SubmitTaskDto,
  ): Promise<TaskSubmission> {
    await this.findById(taskId);

    if (!dto.content?.trim() && !dto.fileUrl?.trim()) {
      throw new BadRequestException(
        'Submission must include content or fileUrl',
      );
    }

    const existing = await this.submissionRepo.findOne({
      where: { taskId, userId },
    });

    if (existing) {
      existing.content = dto.content?.trim() ?? null;
      existing.fileUrl = dto.fileUrl?.trim() ?? null;
      return this.submissionRepo.save(existing);
    }

    const submission = this.submissionRepo.create({
      taskId,
      userId,
      content: dto.content?.trim() ?? null,
      fileUrl: dto.fileUrl?.trim() ?? null,
      score: null,
    });
    return this.submissionRepo.save(submission);
  }

  async findSubmissionsByTask(taskId: number): Promise<TaskSubmission[]> {
    await this.findById(taskId);
    return this.submissionRepo.find({
      where: { taskId },
      order: { submittedAt: 'DESC' },
    });
  }

  async findSubmissionById(submissionId: number): Promise<TaskSubmission> {
    const submission = await this.submissionRepo.findOne({
      where: { id: submissionId },
    });
    if (!submission) {
      throw new NotFoundException('Submission not found');
    }
    return submission;
  }

  async gradeSubmission(
    submissionId: number,
    score: number,
  ): Promise<TaskSubmission> {
    const submission = await this.findSubmissionById(submissionId);
    submission.score = score;
    return this.submissionRepo.save(submission);
  }
}
