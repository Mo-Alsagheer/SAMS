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
import { ApplicationsService } from './applications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/role.enum';
import { Request } from 'express';

@Controller('applications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @Roles(Role.USER)
  createDraft(@Body('committeeId') committeeId: string, @Req() req: Request) {
    const userId = req.user['sub']; // JWT payload usually puts user ID in sub
    return this.applicationsService.createDraft(userId, committeeId);
  }

  @Patch(':id')
  @Roles(Role.USER)
  updateDraft(@Param('id') id: string, @Body() updateData: any) {
    // Stubs for future implementation (answers, etc)
    return this.applicationsService.updateDraft(id, updateData);
  }

  @Post(':id/submit')
  @Roles(Role.USER)
  submit(@Param('id') id: string) {
    return this.applicationsService.submit(id);
  }

  @Get('me')
  @Roles(Role.USER)
  findMyApplications(@Req() req: Request) {
    const userId = req.user['sub'];
    return this.applicationsService.findByUserId(userId);
  }

  @Get(':id')
  @Roles(Role.USER)
  findOne(@Param('id') id: string) {
    return this.applicationsService.findOne(id);
  }
}
