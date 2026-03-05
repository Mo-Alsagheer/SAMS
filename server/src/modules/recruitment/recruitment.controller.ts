import { Controller, Post, Param, UseGuards, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RecruitmentService } from './recruitment.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/constants/role.enum';
import { Request } from 'express';
import { Req } from '@nestjs/common';

@ApiTags('recruitment')
@ApiBearerAuth()
@Controller('executive/recruitment')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RecruitmentController {
  constructor(private readonly recruitmentService: RecruitmentService) {}

  @Post(':committeeId/open')
  @Roles(Role.EXECUTIVE)
  @ApiOperation({ summary: 'Open recruitment process for a committee' })
  openRecruitment(
    @Param('committeeId') committeeId: string,
    @Req() req: Request,
  ) {
    const userId = req.user['sub'];
    return this.recruitmentService.openProcess(userId, committeeId);
  }

  @Post(':committeeId/close')
  @Roles(Role.EXECUTIVE)
  @ApiOperation({ summary: 'Close recruitment process for a committee' })
  closeRecruitment(@Param('committeeId') committeeId: string) {
    return this.recruitmentService.closeProcess(committeeId);
  }

  @Get()
  @Roles(Role.EXECUTIVE)
  @ApiOperation({ summary: 'List all recruitment processes' })
  findAll() {
    return this.recruitmentService.findAll();
  }
}
