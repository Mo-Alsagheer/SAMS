import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ExecutiveService } from './executive.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/constants/role.enum';

@ApiTags('executive')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.EXECUTIVE)
@Controller('executive')
export class ExecutiveController {
  constructor(private readonly executiveService: ExecutiveService) {}

  @Get('committees/:committeeId/directors')
  @ApiOperation({ summary: 'Get all directors for a specific committee' })
  @ApiResponse({ status: 200, description: 'List of directors returned.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Requires Executive role.' })
  getDirectorsByCommittee(@Param('committeeId') committeeId: string) {
    return this.executiveService.getDirectorsByCommittee(committeeId);
  }

  @Get('committees/:committeeId/members')
  @ApiOperation({ summary: 'Get all members for a specific committee' })
  @ApiResponse({ status: 200, description: 'List of members returned.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Requires Executive role.' })
  getMembersByCommittee(@Param('committeeId') committeeId: string) {
    return this.executiveService.getMembersByCommittee(committeeId);
  }
}
