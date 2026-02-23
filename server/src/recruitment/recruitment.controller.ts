import { Controller, Post, Param, UseGuards, Get } from '@nestjs/common';
import { RecruitmentService } from './recruitment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/role.enum';
import { Request } from 'express';
import { Req } from '@nestjs/common';

@Controller('executive/recruitment')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RecruitmentController {
  constructor(private readonly recruitmentService: RecruitmentService) {}

  @Post(':committeeId/open')
  @Roles(Role.EXECUTIVE)
  openRecruitment(
    @Param('committeeId') committeeId: string,
    @Req() req: Request,
  ) {
    const userId = req.user['sub'];
    return this.recruitmentService.openProcess(userId, committeeId);
  }

  @Post(':committeeId/close')
  @Roles(Role.EXECUTIVE)
  closeRecruitment(@Param('committeeId') committeeId: string) {
    return this.recruitmentService.closeProcess(committeeId);
  }

  @Get()
  @Roles(Role.EXECUTIVE)
  findAll() {
    return this.recruitmentService.findAll();
  }
}
