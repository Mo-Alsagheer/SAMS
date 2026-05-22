import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { GradeSubmissionDto } from './dto/grade-submission.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/constants/role.enum';
import { ParseIntIdPipe } from '../../common/pipes/parse-int-id.pipe';
import { Request } from 'express';
import { AuthUser } from '../auth/auth.types';

@ApiTags('director')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.DIRECTOR)
@Controller('director')
export class DirectorTasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post('sessions/:sessionId/tasks')
  @ApiOperation({ summary: 'Create a task for a session' })
  @ApiParam({ name: 'sessionId', description: 'Numeric session ID' })
  @ApiBody({ type: CreateTaskDto })
  @ApiResponse({ status: 201, description: 'Task created.' })
  createTask(
    @Param('sessionId', ParseIntIdPipe) sessionId: number,
    @Body() dto: CreateTaskDto,
  ) {
    return this.tasksService.createForSession(sessionId, dto);
  }

  @Get('tasks/:taskId/submissions')
  @ApiOperation({ summary: 'List all submissions for a task' })
  @ApiParam({ name: 'taskId', description: 'Numeric task ID' })
  @ApiResponse({ status: 200, description: 'Submissions returned.' })
  listSubmissions(@Param('taskId', ParseIntIdPipe) taskId: number) {
    return this.tasksService.findSubmissionsByTask(taskId);
  }

  @Patch('submissions/:submissionId/score')
  @ApiOperation({ summary: 'Grade a submission (0–5)' })
  @ApiParam({ name: 'submissionId', description: 'Numeric submission ID' })
  @ApiBody({ type: GradeSubmissionDto })
  @ApiResponse({ status: 200, description: 'Submission graded.' })
  gradeSubmission(
    @Param('submissionId', ParseIntIdPipe) submissionId: number,
    @Body() dto: GradeSubmissionDto,
    @Req() req: Request & { user: AuthUser },
  ) {
    return this.tasksService.gradeSubmission(
      submissionId,
      dto.score,
      req.user.id,
    );
  }
}
