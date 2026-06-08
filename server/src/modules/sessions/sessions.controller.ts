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
import { RolesGuard } from '../../common/guards/roles.guard';
import { Role } from '../../common/constants/role.enum';
import { Roles } from '../../common/decorators/roles.decorator';
import { ParseIntIdPipe } from '../../common/pipes/parse-int-id.pipe';
import { Request } from 'express';
import { AuthUser } from '../auth/auth.types';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';

@ApiTags('sessions')
@ApiBearerAuth()
@Controller('sessions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  @Roles(Role.DIRECTOR)
  @ApiOperation({ summary: 'Create a new session' })
  @ApiResponse({
    status: 201,
    description: 'The session has been successfully created.',
  })
  create(
    @Body() createSessionDto: CreateSessionDto,
    @Req() req: Request & { user: AuthUser },
  ) {
    return this.sessionsService.create(createSessionDto, req.user);
  }

  @Get('roadmap/:roadmapId')
  @ApiOperation({ summary: 'Get all sessions for a specific roadmap' })
  @ApiParam({ name: 'roadmapId', description: 'Numeric Roadmap ID' })
  @ApiResponse({ status: 200, description: 'Return all sessions for the roadmap.' })
  findAll(@Param('roadmapId', ParseIntIdPipe) roadmapId: number) {
    return this.sessionsService.findAll(roadmapId);
  }

  @Get('my-meetings')
  @ApiOperation({ summary: 'Get all scheduled meetings for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Return all scheduled meetings for the current user.',
  })
  findMyMeetings(@Req() req: Request & { user: AuthUser }) {
    return this.sessionsService.findMyMeetings(req.user);
  }

  @Get('member-experience')
  @ApiOperation({ summary: 'Get the member dashboard experience data' })
  @ApiResponse({ status: 200, description: 'Return member experience data.' })
  getMemberExperience(@Req() req: Request & { user: AuthUser }) {
    return this.sessionsService.getMemberExperience(req.user);
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
  @Roles(Role.DIRECTOR)
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
    @Req() req: Request & { user: AuthUser },
  ) {
    return this.sessionsService.update(id, updateSessionDto, req.user);
  }

  @Delete(':id')
  @Roles(Role.DIRECTOR)
  @ApiOperation({ summary: 'Delete a session' })
  @ApiParam({ name: 'id', description: 'Numeric session ID' })
  @ApiResponse({
    status: 200,
    description: 'The session has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Session not found.' })
  remove(
    @Param('id', ParseIntIdPipe) id: number,
    @Req() req: Request & { user: AuthUser },
  ) {
    return this.sessionsService.remove(id, req.user);
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
