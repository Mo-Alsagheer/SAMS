import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { ExecutiveService } from './executive.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/constants/role.enum';

@ApiTags('executive')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.EXECUTIVE)
@Controller('executive')
export class ExecutiveController {
  constructor(private readonly executiveService: ExecutiveService) {}

  @Get('committees/:committeeId/directors')
  @ApiOperation({ summary: 'Get all directors for a specific committee' })
  @ApiResponse({ status: 200, description: 'List of directors returned.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Requires Executive role.',
  })
  getDirectorsByCommittee(@Param('committeeId') committeeId: string) {
    return this.executiveService.getDirectorsByCommittee(committeeId);
  }

  @Get('committees/:committeeId/members')
  @ApiOperation({ summary: 'Get all members for a specific committee' })
  @ApiResponse({ status: 200, description: 'List of members returned.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Requires Executive role.',
  })
  getMembersByCommittee(@Param('committeeId') committeeId: string) {
    return this.executiveService.getMembersByCommittee(committeeId);
  }

  @Get('applications')
  @ApiOperation({ summary: 'Get applications for director or executive role' })
  @ApiQuery({
    name: 'committeeId',
    required: false,
    description: 'ULID of the committee (omit to fetch EXECUTIVE applications)',
    example: '01HRGZ...',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by application status',
    example: 'PENDING',
  })
  @ApiResponse({
    status: 200,
    description: 'List of applications for the specified committee or role.',
  })
  getApplications(
    @Query('committeeId') committeeId?: string,
    @Query('status') status?: string,
  ) {
    return this.executiveService.getApplications(committeeId, status);
  }

  @Post('applications/:id/phase1/accept')
  @ApiOperation({ summary: 'Accept director application for Phase 1' })
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
  acceptPhase1(@Param('id') id: string) {
    return this.executiveService.acceptPhase1(id);
  }

  @Post('applications/:id/phase1/reject')
  @ApiOperation({ summary: 'Reject director application for Phase 1' })
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
  rejectPhase1(@Param('id') id: string) {
    return this.executiveService.rejectPhase1(id);
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
  scheduleInterview(@Param('id') id: string, @Body() payload: any) {
    return this.executiveService.scheduleInterview(id, payload);
  }

  @Post('applications/:id/phase2/accept')
  @ApiOperation({ summary: 'Accept director application for Phase 2' })
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
  acceptPhase2(@Param('id') id: string) {
    return this.executiveService.acceptPhase2(id);
  }

  @Post('applications/:id/phase2/reject')
  @ApiOperation({ summary: 'Reject director application for Phase 2' })
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
  rejectPhase2(@Param('id') id: string) {
    return this.executiveService.rejectPhase2(id);
  }
}
