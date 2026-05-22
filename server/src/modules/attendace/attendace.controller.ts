import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { AttendaceService } from './attendace.service';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/constants/role.enum';
import { ParseIntIdPipe } from '../../common/pipes/parse-int-id.pipe';
import { AuthUser } from '../auth/auth.types';

@ApiTags('attendance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class AttendaceController {
  constructor(private readonly attendaceService: AttendaceService) {}

  @Get('director/sessions/:sessionId/attendance')
  @Roles(Role.DIRECTOR)
  @ApiOperation({
    summary: 'List committee members and attendance status for a session',
  })
  @ApiParam({ name: 'sessionId', description: 'Numeric session ID' })
  @ApiResponse({ status: 200, description: 'Attendance roster returned.' })
  @ApiResponse({ status: 404, description: 'Session or roadmap not found.' })
  getSessionAttendance(@Param('sessionId', ParseIntIdPipe) sessionId: number) {
    return this.attendaceService.getSessionAttendance(sessionId);
  }

  @Patch('director/sessions/:sessionId/attendance')
  @Roles(Role.DIRECTOR)
  @ApiOperation({
    summary: 'Mark attendance for committee members who attended the session',
  })
  @ApiParam({ name: 'sessionId', description: 'Numeric session ID' })
  @ApiBody({ type: MarkAttendanceDto })
  @ApiResponse({ status: 200, description: 'Attendance updated.' })
  @ApiResponse({
    status: 400,
    description: 'Invalid user IDs or session not linked to a roadmap.',
  })
  markSessionAttendance(
    @Param('sessionId', ParseIntIdPipe) sessionId: number,
    @Body() dto: MarkAttendanceDto,
    @Req() req: Request & { user?: AuthUser },
  ) {
    const directorId = req.user?.id ?? 1; // Default to 1 for testing
    return this.attendaceService.markAttendance(
      sessionId,
      dto.members,
      directorId,
    );
  }

  @Get('users/me/score')
  @ApiOperation({ summary: 'Get total score (attendance + tasks)' })
  @ApiResponse({ status: 200, description: 'Score breakdown returned.' })
  getMyScore(@Req() req: Request & { user: AuthUser }) {
    return this.attendaceService.getUserScore(req.user.id);
  }

  @Get('committees/:committeeId/scoreboard')
  @Roles(Role.DIRECTOR)
  @ApiOperation({ summary: 'View scores for all committee members' })
  @ApiParam({
    name: 'committeeId',
    description: 'Numeric committee ID',
    example: 1,
  })
  @ApiResponse({ status: 200, description: 'Committee scoreboard returned.' })
  @ApiResponse({
    status: 403,
    description: 'Director not assigned to this committee.',
  })
  getScoreboard(
    @Param('committeeId', ParseIntIdPipe) committeeId: number,
    @Req() req: Request & { user: AuthUser },
  ) {
    return this.attendaceService.getCommitteeScoreboardForDirector(
      committeeId,
      req.user.id,
    );
  }
}
