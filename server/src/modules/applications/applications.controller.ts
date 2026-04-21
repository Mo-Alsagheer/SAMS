import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';

@ApiTags('applications')
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post('evaluate-all')
  @ApiOperation({
    summary: 'Evaluate all pending applications using AI without saving to DB',
  })
  @ApiResponse({
    status: 200,
    description: 'Evaluation results directly from the AI service.',
  })
  evaluatePendingApplications() {
    return this.applicationsService.evaluatePendingApplications();
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
    description: 'ULID of the application',
    example: '01HRGZ...',
  })
  @ApiResponse({ status: 200, description: 'Application details retrieved.' })
  @ApiResponse({ status: 404, description: 'Application not found.' })
  findOne(@Param('id') id: string) {
    return this.applicationsService.findOne(id);
  }
}
