import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiConsumes,
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
import { CloudinaryService } from '../../integrations/cloudinary/cloudinary.service';

@ApiTags('director')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.DIRECTOR)
@Controller('director')
export class DirectorTasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post('sessions/:sessionId/tasks')
  @ApiOperation({ summary: 'Create a task for a session' })
  @ApiParam({ name: 'sessionId', description: 'Numeric session ID' })
  @ApiConsumes('multipart/form-data', 'application/json')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({ type: CreateTaskDto })
  @ApiResponse({ status: 201, description: 'Task created.' })
  async createTask(
    @Param('sessionId', ParseIntIdPipe) sessionId: number,
    @Body() dto: CreateTaskDto,
    @Req() req: Request & { user: AuthUser },
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let fileUrl = dto.fileUrl;
    if (file) {
      fileUrl = await this.cloudinaryService.uploadFile(
        file,
        'Task_Materials',
      );
    }
    return this.tasksService.createForSession(sessionId, dto, req.user.id, fileUrl);
  }

  @Delete('tasks/:taskId')
  @ApiOperation({ summary: 'Delete a task' })
  @ApiParam({ name: 'taskId', description: 'Numeric task ID' })
  @ApiResponse({ status: 200, description: 'Task deleted.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  deleteTask(
    @Param('taskId', ParseIntIdPipe) taskId: number,
    @Req() req: Request & { user: AuthUser },
  ) {
    return this.tasksService.deleteTask(taskId, req.user.id);
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
