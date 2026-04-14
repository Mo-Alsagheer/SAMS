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
import { OpenRecruitmentDto } from './dto/open-recruitment.dto';

@ApiTags('recruitment')
@ApiBearerAuth()
@Controller('executive/recruitment')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RecruitmentController {
  constructor(private readonly recruitmentService: RecruitmentService) {}

  @Post('global/open')
  @Roles(Role.EXECUTIVE)
  @ApiOperation({ summary: 'Open a global recruitment process (e.g. for executives)' })
  @ApiResponse({ status: 201, description: 'Global recruitment process successfully opened.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Requires Executive role.' })
  @ApiBody({ type: OpenRecruitmentDto })
  openGlobalRecruitment(
    @Body() dto: OpenRecruitmentDto,
    @Req() req: Request,
  ) {
    const user = req.user as AuthUser;
    return this.recruitmentService.openGlobalProcess(user.id, dto);
  }

  @Post(':committeeId/open')
  @Roles(Role.EXECUTIVE)
  @ApiOperation({ summary: 'Open recruitment process for a committee' })
  @ApiParam({ name: 'committeeId', description: 'ULID of the committee', example: '01HRGZ...' })
  @ApiResponse({ status: 201, description: 'Recruitment process successfully opened.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Requires Executive role.' })
  @ApiResponse({ status: 404, description: 'Committee not found.' })
  @ApiBody({ type: OpenRecruitmentDto })
  openRecruitment(
    @Param('committeeId') committeeId: string,
    @Body() dto: OpenRecruitmentDto,
    @Req() req: Request,
  ) {
    const user = req.user as AuthUser;
    return this.recruitmentService.openProcess(user.id, committeeId, dto);
  }

  @Post(':id/close')
  @Roles(Role.EXECUTIVE)
  @ApiOperation({ summary: 'Close a specific recruitment process' })
  @ApiParam({ name: 'id', description: 'ULID of the recruitment process', example: '01HRGZ...' })
  @ApiResponse({ status: 201, description: 'Recruitment process successfully closed.' })
  @ApiResponse({ status: 404, description: 'Active recruitment process not found.' })
  closeRecruitment(@Param('id') id: string) {
    return this.recruitmentService.closeProcess(id);
  }

  @Get()
  @Roles(Role.EXECUTIVE)
  @ApiOperation({ summary: 'List all recruitment processes' })
  @ApiResponse({ status: 200, description: 'List of all recruitment processes across committees.' })
  findAll() {
    return this.recruitmentService.findAll();
  }
}
