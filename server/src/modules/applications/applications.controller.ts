import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApplicationsService } from './applications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/constants/role.enum';
import { Request } from 'express';

@ApiTags('applications')
@ApiBearerAuth()
@Controller('applications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @Roles(Role.USER)
  @ApiOperation({ summary: 'Create a draft application' })
  createDraft(@Body('committeeId') committeeId: string, @Req() req: Request) {
    const userId = req.user['sub']; // JWT payload usually puts user ID in sub
    return this.applicationsService.createDraft(userId, committeeId);
  }

  @Patch(':id')
  @Roles(Role.USER)
  @ApiOperation({ summary: 'Update a draft application' })
  updateDraft(@Param('id') id: string, @Body() updateData: any) {
    // Stubs for future implementation (answers, etc)
    return this.applicationsService.updateDraft(id, updateData);
  }

  @Post(':id/submit')
  @Roles(Role.USER)
  @ApiOperation({ summary: 'Submit an application' })
  submit(@Param('id') id: string) {
    return this.applicationsService.submit(id);
  }

  @Get('me')
  @Roles(Role.USER)
  @ApiOperation({ summary: 'Get current user applications' })
  findMyApplications(@Req() req: Request) {
    const userId = req.user['sub'];
    return this.applicationsService.findByUserId(userId);
  }

  @Get(':id')
  @Roles(Role.USER)
  @ApiOperation({ summary: 'Get a specific application' })
  findOne(@Param('id') id: string) {
    return this.applicationsService.findOne(id);
  }
}
