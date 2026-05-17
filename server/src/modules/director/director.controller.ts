import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DirectorService } from './director.service';
import { SessionsService } from '../sessions/sessions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/constants/role.enum';
import { ParseIntIdPipe } from '../../common/pipes/parse-int-id.pipe';

@ApiTags('director')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.DIRECTOR)
@Controller('director')
export class DirectorController {
  constructor(
    private readonly directorService: DirectorService,
    private readonly sessionsService: SessionsService,
  ) {}

  @Get('applications')
  @ApiOperation({ summary: 'Get applications for a committee' })
  @ApiQuery({
    name: 'committeeId',
    required: true,
    description: 'Numeric committee ID',
    example: 1,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by application status',
    example: 'PENDING',
  })
  @ApiResponse({
    status: 200,
    description: 'List of applications for the specified committee.',
  })
  getApplications(
    @Query('committeeId', ParseIntPipe) committeeId: number,
    @Query('status') status?: string,
  ) {
    return this.directorService.getApplications(committeeId, status);
  }

  @Post('applications/:id/phase1/accept')
  @ApiOperation({ summary: 'Accept application for Phase 1' })
  @ApiParam({
    name: 'id',
    description: 'ULID of the application',
    example: '01HRGZ...',
  })
  @ApiResponse({
    status: 201,
    description: 'Application accepted for Phase 1.',
  })
  @ApiResponse({ status: 404, description: 'Application not found.' })
  acceptPhase1(@Param('id', ParseIntIdPipe) id: number) {
    return this.directorService.acceptPhase1(id);
  }

  @Post('applications/:id/phase1/reject')
  @ApiOperation({ summary: 'Reject application for Phase 1' })
  @ApiParam({
    name: 'id',
    description: 'ULID of the application',
    example: '01HRGZ...',
  })
  @ApiResponse({
    status: 201,
    description: 'Application rejected during Phase 1.',
  })
  @ApiResponse({ status: 404, description: 'Application not found.' })
  rejectPhase1(@Param('id', ParseIntIdPipe) id: number) {
    return this.directorService.rejectPhase1(id);
  }

  @Post('applications/:id/interview/schedule')
  @ApiOperation({ summary: 'Schedule interview for an applicant' })
  @ApiParam({
    name: 'id',
    description: 'ULID of the application',
    example: '01HRGZ...',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          format: 'date-time',
          example: '2023-11-15T10:00:00Z',
        },
        link: {
          type: 'string',
          example: 'https://meet.google.com/abc-defg-hij',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Interview scheduled successfully.',
  })
  @ApiResponse({ status: 404, description: 'Application not found.' })
  scheduleInterview(@Param('id', ParseIntIdPipe) id: number, @Body() payload: any) {
    return this.directorService.scheduleInterview(id, payload);
  }

  @Post('applications/:id/phase2/accept')
  @ApiOperation({ summary: 'Accept application for Phase 2' })
  @ApiParam({
    name: 'id',
    description: 'ULID of the application',
    example: '01HRGZ...',
  })
  @ApiResponse({
    status: 201,
    description: 'Application accepted for Phase 2.',
  })
  @ApiResponse({ status: 404, description: 'Application not found.' })
  acceptPhase2(@Param('id', ParseIntIdPipe) id: number) {
    return this.directorService.acceptPhase2(id);
  }

  @Post('applications/:id/phase2/reject')
  @ApiOperation({ summary: 'Reject application for Phase 2' })
  @ApiParam({
    name: 'id',
    description: 'ULID of the application',
    example: '01HRGZ...',
  })
  @ApiResponse({
    status: 201,
    description: 'Application rejected during Phase 2.',
  })
  @ApiResponse({ status: 404, description: 'Application not found.' })
  rejectPhase2(@Param('id', ParseIntIdPipe) id: number) {
    return this.directorService.rejectPhase2(id);
  }

  @Post('sessions/:sessionId/meeting/create')
  @ApiOperation({ summary: 'Create a plugNmeet video session room' })
  @ApiParam({
    name: 'sessionId',
    description: 'Numeric session ID',
    example: 1,
  })
  @ApiResponse({
    status: 201,
    description: 'Meeting room created successfully.',
  })
  @ApiResponse({ status: 404, description: 'Session not found.' })
  createMeeting(@Param('sessionId', ParseIntIdPipe) sessionId: number) {
    return this.sessionsService.createMeeting(sessionId);
  }

  @Post('sessions/:sessionId/meeting/end')
  @ApiOperation({ summary: 'End a session meeting' })
  @ApiParam({ name: 'sessionId', description: 'Numeric session ID' })
  @ApiResponse({ status: 200, description: 'Meeting ended successfully.' })
  endSessionMeeting(@Param('sessionId', ParseIntIdPipe) sessionId: number) {
    return this.sessionsService.endMeeting(sessionId);
  }
}
