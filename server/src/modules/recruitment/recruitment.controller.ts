import {
  Controller,
  Post,
  Param,
  UseGuards,
  Get,
  Body,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiBody,
} from '@nestjs/swagger';
import { RecruitmentService } from './recruitment.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/constants/role.enum';
import { Request } from 'express';
import { Req } from '@nestjs/common';
import { AuthUser } from '../auth/auth.types';
import { OpenRecruitmentDto } from './dto/open-recruitment.dto';
import { Public } from '../../common/decorators/public.decorator';
import { ParseIntIdPipe } from '../../common/pipes/parse-int-id.pipe';

@ApiTags('recruitment')
@ApiBearerAuth()
@Controller('executive/recruitment')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RecruitmentController {
  constructor(private readonly recruitmentService: RecruitmentService) {}

  @Post('global/open')
  @Roles(Role.EXECUTIVE)
  @ApiOperation({
    summary: 'Open a global recruitment process (e.g. for executives)',
  })
  @ApiResponse({
    status: 201,
    description: 'Global recruitment process successfully opened.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Requires Executive role.',
  })
  @ApiBody({ type: OpenRecruitmentDto })
  openGlobalRecruitment(@Body() dto: OpenRecruitmentDto, @Req() req: Request) {
    const user = req.user as AuthUser;
    return this.recruitmentService.openGlobalProcess(user.id, dto);
  }

  @Post(':committeeId/open')
  @Roles(Role.EXECUTIVE)
  @ApiOperation({ summary: 'Open recruitment process for a committee' })
  @ApiParam({
    name: 'committeeId',
    description: 'ULID of the committee',
    example: '01HRGZ...',
  })
  @ApiResponse({
    status: 201,
    description: 'Recruitment process successfully opened.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Requires Executive role.',
  })
  @ApiResponse({ status: 404, description: 'Committee not found.' })
  @ApiBody({ type: OpenRecruitmentDto })
  openRecruitment(
    @Param('committeeId', ParseIntIdPipe) committeeId: number,
    @Body() dto: OpenRecruitmentDto,
    @Req() req: Request,
  ) {
    const user = req.user as AuthUser;
    return this.recruitmentService.openProcess(user.id, committeeId, dto);
  }

  @Post(':id/close')
  @Roles(Role.EXECUTIVE)
  @ApiOperation({ summary: 'Close a specific recruitment process' })
  @ApiParam({
    name: 'id',
    description: 'ULID of the recruitment process',
    example: '01HRGZ...',
  })
  @ApiResponse({
    status: 201,
    description: 'Recruitment process successfully closed.',
  })
  @ApiResponse({
    status: 404,
    description: 'Active recruitment process not found.',
  })
  closeRecruitment(@Param('id', ParseIntIdPipe) id: number) {
    return this.recruitmentService.closeProcess(id);
  }

  @Get()
  @Roles(Role.EXECUTIVE)
  @ApiOperation({ summary: 'List all recruitment processes' })
  @ApiResponse({
    status: 200,
    description: 'List of all recruitment processes across committees.',
  })
  findAll() {
    return this.recruitmentService.findAll();
  }

  @Get('global')
  @Public()
  @ApiOperation({ summary: 'List all global recruitment processes (where committeeId is null)' })
  @ApiResponse({
    status: 200,
    description: 'List of all global recruitment processes.',
  })
  findGlobal() {
    return this.recruitmentService.findGlobalProcesses();
  }

  @Get(':committeeId/status')
  @Public()
  @ApiOperation({ summary: 'Get recruitment status for a specific committee' })
  @ApiParam({
    name: 'committeeId',
    description: 'ULID of the committee',
    example: '01HRGZ...',
  })
  @ApiQuery({
    name: 'role',
    required: false,
    enum: ['MEMBER', 'DIRECTOR'],
    description:
      'Filter by role (MEMBER or DIRECTOR). Returns combined status if omitted.',
  })
  @ApiResponse({
    status: 200,
    description: 'Recruitment status for the committee.',
    schema: {
      example: {
        committeeId: '01HRGZ...',
        committeeName: 'Tech Committee',
        isOpen: true,
        status: 'OPEN',
        processes: [
          {
            id: '01HRGZ...',
            role: 'MEMBER',
            status: 'OPEN',
            targetMembers: 10,
            openedAt: '2026-04-17T00:00:00.000Z',
            closedAt: null,
          },
        ],
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Committee not found.' })
  getCommitteeStatus(
    @Param('committeeId', ParseIntIdPipe) committeeId: number,
    @Query('role') role?: 'MEMBER' | 'DIRECTOR',
  ) {
    return this.recruitmentService.getStatusByCommittee(
      committeeId,
      role as any,
    );
  }
}
