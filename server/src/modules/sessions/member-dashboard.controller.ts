import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SessionsService } from './sessions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Request } from 'express';
import { AuthUser } from '../auth/auth.types';

/**
 * Controller to handle member dashboard specific routes.
 */
@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('member-dashboard')
export class MemberDashboardController {
  constructor(private readonly sessionsService: SessionsService) {}

  /**
   * Retrieves aggregated data for the member dashboard.
   * This includes committee details, statistics (like attendance rate and pending tasks),
   * upcoming session information, and a list of the most recent tasks.
   *
   * @param req The incoming request containing the authenticated member.
   * @returns An object conforming to the member dashboard frontend requirements.
   */
  @Get()
  @ApiOperation({ summary: 'Get the member dashboard overview data' })
  @ApiResponse({
    status: 200,
    description: 'Return member dashboard stats and next session.',
  })
  getMemberDashboard(@Req() req: Request & { user: AuthUser }) {
    return this.sessionsService.getMemberDashboard(req.user);
  }
}
