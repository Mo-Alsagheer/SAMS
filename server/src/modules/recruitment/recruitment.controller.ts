import { Controller, Post, Param, UseGuards, Get, Body, ParseIntPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';
import { RecruitmentService } from './recruitment.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/constants/role.enum';
import { Request } from 'express';
import { Req } from '@nestjs/common';
import { AuthUser } from '../auth/auth.types';

@ApiTags('recruitment')
@ApiBearerAuth()
@Controller('executive/recruitment')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RecruitmentController {
  constructor(private readonly recruitmentService: RecruitmentService) {}

  @Post(':committeeId/open')
  @Roles(Role.EXECUTIVE)
  @ApiOperation({ summary: 'Open recruitment process for a committee' })
  @ApiParam({ name: 'committeeId', description: 'ULID of the committee', example: '01HRGZ...' })
  @ApiResponse({ status: 201, description: 'Recruitment process successfully opened.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Requires Executive role.' })
  @ApiResponse({ status: 404, description: 'Committee not found.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        targetMembers: { type: 'number', example: 10 }
      }
    }
  })
  openRecruitment(
    @Param('committeeId') committeeId: string,
    @Body('targetMembers', ParseIntPipe) targetMembers: number,
    @Req() req: Request,
  ) {
    const user = req.user as AuthUser;
    return this.recruitmentService.openProcess(user.id, committeeId, targetMembers);
  }

  @Post(':committeeId/close')
  @Roles(Role.EXECUTIVE)
  @ApiOperation({ summary: 'Close recruitment process for a committee' })
  @ApiParam({ name: 'committeeId', description: 'ULID of the committee', example: '01HRGZ...' })
  @ApiResponse({ status: 201, description: 'Recruitment process successfully closed.' })
  @ApiResponse({ status: 404, description: 'Committee or active recruitment process not found.' })
  closeRecruitment(@Param('committeeId') committeeId: string) {
    return this.recruitmentService.closeProcess(committeeId);
  }

  @Get()
  @Roles(Role.EXECUTIVE)
  @ApiOperation({ summary: 'List all recruitment processes' })
  @ApiResponse({ status: 200, description: 'List of all recruitment processes across committees.' })
  findAll() {
    return this.recruitmentService.findAll();
  }
}
