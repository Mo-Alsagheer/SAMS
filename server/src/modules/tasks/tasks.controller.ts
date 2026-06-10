import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
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
import { CloudinaryService } from '../../integrations/cloudinary/cloudinary.service';

@ApiTags('tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

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
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiResponse({ status: 201, description: 'Submission saved.' })
  async submit(
    @Param('taskId', ParseIntIdPipe) taskId: number,
    @Body() dto: SubmitTaskDto,
    @Req() req: Request & { user: AuthUser },
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let fileUrl: string | undefined;
    if (file) {
      fileUrl = await this.cloudinaryService.uploadFile(
        file,
        'Task_Submissions',
      );
    }
    return this.tasksService.submit(taskId, req.user.id, dto, fileUrl);
  }
}
