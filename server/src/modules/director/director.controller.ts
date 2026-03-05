import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { DirectorService } from './director.service';

@ApiTags('director')
@Controller('director')
export class DirectorController {
  constructor(private readonly directorService: DirectorService) {}

  @Get('applications')
  @ApiOperation({ summary: 'Get applications for a committee' })
  @ApiQuery({ name: 'committeeId', required: true })
  @ApiQuery({ name: 'status', required: false })
  getApplications(
    @Query('committeeId') committeeId: string,
    @Query('status') status?: string,
  ) {
    return this.directorService.getApplications(committeeId, status);
  }

  @Post('applications/:id/phase1/accept')
  @ApiOperation({ summary: 'Accept application for Phase 1' })
  acceptPhase1(@Param('id') id: string) {
    return this.directorService.acceptPhase1(id);
  }

  @Post('applications/:id/phase1/reject')
  @ApiOperation({ summary: 'Reject application for Phase 1' })
  rejectPhase1(@Param('id') id: string) {
    return this.directorService.rejectPhase1(id);
  }

  @Post('applications/:id/interview/schedule')
  @ApiOperation({ summary: 'Schedule interview for an applicant' })
  scheduleInterview(@Param('id') id: string, @Body() payload: any) {
    return this.directorService.scheduleInterview(id, payload);
  }

  @Post('applications/:id/phase2/accept')
  @ApiOperation({ summary: 'Accept application for Phase 2' })
  acceptPhase2(@Param('id') id: string) {
    return this.directorService.acceptPhase2(id);
  }

  @Post('applications/:id/phase2/reject')
  @ApiOperation({ summary: 'Reject application for Phase 2' })
  rejectPhase2(@Param('id') id: string) {
    return this.directorService.rejectPhase2(id);
  }
}
