import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { ParseIntIdPipe } from '../../common/pipes/parse-int-id.pipe';
@ApiTags('applications')
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post('evaluate-all/:processId')
  @ApiOperation({
    summary:
      'Evaluate all pending applications for a specified recruitment process using AI without saving to DB',
  })
  @ApiParam({
    name: 'processId',
    description: 'Numeric Recruitment Process ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Evaluation results directly from the AI service.',
  })
  evaluatePendingApplications(
    @Param('processId', ParseIntIdPipe) processId: number,
  ) {
    return this.applicationsService.evaluatePendingApplicationsForProcess(
      processId,
    );
  }

  @Post('submit')
  @ApiOperation({ summary: 'Submit an application directly' })
  @ApiResponse({
    status: 201,
    description: 'Application submitted successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Recruitment is not open for this committee.',
  })
  @ApiResponse({
    status: 409,
    description: 'An application with this email has already been submitted.',
  })
  createApplication(@Body() dto: CreateApplicationDto) {
    return this.applicationsService.createApplication(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific application' })
  @ApiParam({
    name: 'id',
    description: 'Numeric application ID',
    example: 1,
  })
  @ApiResponse({ status: 200, description: 'Application details retrieved.' })
  @ApiResponse({ status: 404, description: 'Application not found.' })
  findOne(@Param('id', ParseIntIdPipe) id: number) {
    return this.applicationsService.findOne(id);
  }
}
