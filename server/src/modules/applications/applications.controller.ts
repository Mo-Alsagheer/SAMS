import { Controller, Post, Get, Param, Body, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { ParseIntIdPipe } from '../../common/pipes/parse-int-id.pipe';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthUser } from '../auth/auth.types';

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

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
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
  createApplication(
    @Body() dto: CreateApplicationDto,
    @Req() req: Request & { user: AuthUser },
  ) {
    return this.applicationsService.createApplication(dto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Get current user applications' })
  @ApiResponse({ status: 200, description: 'Applications retrieved.' })
  findMyApplications(@Req() req: Request & { user: AuthUser }) {
    return this.applicationsService.findByUserId(req.user.id);
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
