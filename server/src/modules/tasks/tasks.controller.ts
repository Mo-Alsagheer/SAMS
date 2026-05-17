import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { TasksService } from './tasks.service';
import { SubmitTaskDto } from './dto/submit-task.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ParseIntIdPipe } from '../../common/pipes/parse-int-id.pipe';
import { AuthUser } from '../auth/auth.types';

@ApiTags('tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('sessions/:sessionId/tasks')
  @ApiOperation({ summary: 'List tasks for a session' })
  @ApiParam({ name: 'sessionId', description: 'Numeric session ID' })
  @ApiResponse({ status: 200, description: 'Tasks returned.' })
  listBySession(@Param('sessionId', ParseIntIdPipe) sessionId: number) {
    return this.tasksService.findBySession(sessionId);
  }

  @Post('tasks/:taskId/submissions')
  @ApiOperation({ summary: 'Submit a task (member)' })
  @ApiParam({ name: 'taskId', description: 'Numeric task ID' })
  @ApiResponse({ status: 201, description: 'Submission saved.' })
  submit(
    @Param('taskId', ParseIntIdPipe) taskId: number,
    @Body() dto: SubmitTaskDto,
    @Req() req: Request & { user: AuthUser },
  ) {
    return this.tasksService.submit(taskId, req.user.id, dto);
  }
}
