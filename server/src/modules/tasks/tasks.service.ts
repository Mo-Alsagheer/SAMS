import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { TaskSubmission } from './entities/task-submission.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { SubmitTaskDto } from './dto/submit-task.dto';
import { SessionsService } from '../sessions/sessions.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
    @InjectRepository(TaskSubmission)
    private readonly submissionRepo: Repository<TaskSubmission>,
    private readonly sessionsService: SessionsService,
    private readonly audit: AuditLogService,
    private readonly usersService: UsersService,
  ) {}

  async createForSession(
    sessionId: number,
    dto: CreateTaskDto,
    creatorId: number,
    fileUrl?: string,
  ): Promise<Task> {
    await this.sessionsService.findById(sessionId);

    const task = this.taskRepo.create({
      sessionId,
      creatorId,
      title: dto.title,
      description: dto.description ?? null,
      dueDate: new Date(dto.dueDate),
      fileUrl: fileUrl || dto.fileUrl || null,
    });

    this.audit
      .log({
        action: 'TasksService.createForSession',
        body: { sessionId, dto },
      })
      .catch(() => undefined);

    return this.taskRepo.save(task);
  }

  async findBySession(sessionId: number, userId?: number): Promise<any[]> {
    await this.sessionsService.findById(sessionId);
    const tasks = await this.taskRepo.find({
      where: { sessionId },
      order: { dueDate: 'ASC' },
    });

    if (!userId || tasks.length === 0) {
      return tasks;
    }

    const taskIds = tasks.map((t) => t.id);
    const submissions = await this.submissionRepo.find({
      where: taskIds.map((id) => ({ taskId: id, userId })),
    });

    const now = new Date();

    return tasks.map((task) => {
      const submission = submissions.find((s) => s.taskId === task.id);
      let status = 'pending';

      if (submission) {
        status = submission.score !== null ? 'graded' : 'submitted';
      } else if (new Date(task.dueDate) < now) {
        status = 'missed';
      }

      return {
        ...task,
        status,
        score: submission?.score ?? null,
        submission: submission
          ? {
              id: submission.id,
              content: submission.content,
              fileUrl: submission.fileUrl,
              score: submission.score,
              submittedAt: submission.submittedAt,
            }
          : null,
      };
    });
  }

  async findById(taskId: number): Promise<Task> {
    const task = await this.taskRepo.findOne({ where: { id: taskId } });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }

  async deleteTask(taskId: number, directorId: number): Promise<void> {
    const task = await this.findById(taskId);
    if (task.creatorId !== directorId) {
      throw new ForbiddenException('Only the director who created the task can delete it');
    }

    await this.taskRepo.remove(task);

    this.audit
      .log({
        action: 'TasksService.deleteTask',
        userId: String(directorId),
        body: { taskId },
      })
      .catch(() => undefined);
  }

  async submit(
    taskId: number,
    userId: number,
    dto: SubmitTaskDto,
    fileUrl?: string,
  ): Promise<TaskSubmission> {
    await this.findById(taskId);

    if (!dto.content?.trim() && !fileUrl?.trim()) {
      throw new BadRequestException(
        'Submission must include content or file upload',
      );
    }

    const existing = await this.submissionRepo.findOne({
      where: { taskId, userId },
    });

    if (existing) {
      existing.content = dto.content?.trim() ?? null;
      existing.fileUrl = fileUrl?.trim() ?? null;

      this.audit
        .log({
          action: 'TasksService.updateSubmission',
          userId: String(userId),
          body: { taskId, dto, fileUrl },
        })
        .catch(() => undefined);

      return this.submissionRepo.save(existing);
    }

    const submission = this.submissionRepo.create({
      taskId,
      userId,
      content: dto.content?.trim() ?? null,
      fileUrl: fileUrl?.trim() ?? null,
      score: null,
    });

    this.audit
      .log({
        action: 'TasksService.createSubmission',
        userId: String(userId),
        body: { taskId, dto, fileUrl },
      })
      .catch(() => undefined);

    return this.submissionRepo.save(submission);
  }

  async findSubmissionsByTask(taskId: number): Promise<any[]> {
    await this.findById(taskId);
    const submissions = await this.submissionRepo.find({
      where: { taskId },
      relations: ['user'],
      order: { submittedAt: 'DESC' },
    });

    return submissions.map((sub) => ({
      id: sub.id,
      taskId: sub.taskId,
      userId: sub.userId,
      content: sub.content,
      fileUrl: sub.fileUrl,
      score: sub.score,
      submittedAt: sub.submittedAt,
      memberName: sub.user?.name || '',
      memberEmail: sub.user?.email || '',
    }));
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
    directorId: number,
  ): Promise<TaskSubmission> {
    const submission = await this.findSubmissionById(submissionId);
    submission.score = score;

    this.audit
      .log({
        action: 'TasksService.gradeSubmission',
        userId: String(directorId),
        body: { submissionId, score },
      })
      .catch(() => undefined);

    return this.submissionRepo.save(submission);
  }

  /**
   * Retrieves and categorizes tasks for a specific member based on their committee assignments.
   * Tasks are mapped with additional computed properties like `status` and `score`.
   * 
   * @param userId The ID of the member whose tasks are being retrieved.
   * @returns An object with two arrays: `previousTasks` (submitted or past due) and `currentTasks` (pending).
   */
  async getMemberTasks(userId: number): Promise<{ previousTasks: any[]; currentTasks: any[] }> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.committeeId) {
      return { previousTasks: [], currentTasks: [] };
    }

    // Find all sessions for the user's committee
    const sessions = await this.sessionsService.findByCommitteeId(user.committeeId);
    const sessionIds = sessions.map((s) => s.id);

    if (sessionIds.length === 0) {
      return { previousTasks: [], currentTasks: [] };
    }

    // Find tasks for these sessions
    const tasks = await this.taskRepo.find({
      where: sessionIds.map((id) => ({ sessionId: id })),
      relations: ['session'],
      order: { dueDate: 'DESC' },
    });

    if (tasks.length === 0) {
      return { previousTasks: [], currentTasks: [] };
    }

    const taskIds = tasks.map((t) => t.id);

    // Find user's submissions
    const submissions = await this.submissionRepo.find({
      where: taskIds.map((id) => ({ taskId: id, userId })),
    });

    const previousTasks = [];
    const currentTasks = [];
    const now = new Date();

    for (const task of tasks) {
      const submission = submissions.find((s) => s.taskId === task.id);

      let status = 'pending';
      if (submission) {
        status = submission.score !== null ? 'graded' : 'submitted';
      } else if (new Date(task.dueDate) < now) {
        status = 'missed';
      }

      const mappedTask = {
        id: task.id,
        sessionId: task.sessionId,
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        fileUrl: task.fileUrl,
        sessionTitle: task.session?.title,
        status,
        score: submission?.score ?? null,
        submission: submission
          ? {
              id: submission.id,
              content: submission.content,
              fileUrl: submission.fileUrl,
              score: submission.score,
              submittedAt: submission.submittedAt,
            }
          : null,
      };

      if (submission || new Date(task.dueDate) < now) {
        previousTasks.push(mappedTask);
      } else {
        currentTasks.push(mappedTask);
      }
    }

    return { previousTasks, currentTasks };
  }
}
