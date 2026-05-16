import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SessionsService } from './sessions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ParseIntIdPipe } from '../../common/pipes/parse-int-id.pipe';
import { Request } from 'express';
import { AuthUser } from '../auth/auth.types';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';

@ApiTags('sessions')
@ApiBearerAuth()
@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new session' })
  @ApiResponse({
    status: 201,
    description: 'The session has been successfully created.',
  })
  create(@Body() createSessionDto: CreateSessionDto) {
    return this.sessionsService.create(createSessionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all sessions' })
  @ApiResponse({ status: 200, description: 'Return all sessions.' })
  findAll() {
    return this.sessionsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a session by ID' })
  @ApiParam({ name: 'id', description: 'Numeric session ID' })
  @ApiResponse({ status: 200, description: 'Return the session.' })
  @ApiResponse({ status: 404, description: 'Session not found.' })
  findOne(@Param('id', ParseIntIdPipe) id: number) {
    return this.sessionsService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a session' })
  @ApiParam({ name: 'id', description: 'Numeric session ID' })
  @ApiResponse({
    status: 200,
    description: 'The session has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Session not found.' })
  update(
    @Param('id', ParseIntIdPipe) id: number,
    @Body() updateSessionDto: UpdateSessionDto,
  ) {
    return this.sessionsService.update(id, updateSessionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a session' })
  @ApiParam({ name: 'id', description: 'Numeric session ID' })
  @ApiResponse({
    status: 200,
    description: 'The session has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Session not found.' })
  remove(@Param('id', ParseIntIdPipe) id: number) {
    return this.sessionsService.remove(id);
  }

  @Get(':sessionId/meeting/join')
  async joinMeeting(
    @Param('sessionId', ParseIntIdPipe) sessionId: number,
    @Req() req: Request & { user: AuthUser },
  ) {
    return this.sessionsService.getJoinToken(sessionId, req.user);
  }

  @Get(':sessionId/meeting/recordings')
  async getRecordings(@Param('sessionId', ParseIntIdPipe) sessionId: number) {
    return this.sessionsService.getRecordings(sessionId);
  }
}
