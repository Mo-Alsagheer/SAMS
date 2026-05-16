import { Controller, Get, Req, UseGuards, NotFoundException } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { AttendaceService } from '../attendace/attendace.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Request } from 'express';
import { AuthUser } from '../auth/auth.types';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly attendaceService: AttendaceService,
  ) {}

  @Get('me/score')
  @ApiOperation({ summary: 'Get total score (attendance + tasks)' })
  @ApiResponse({ status: 200, description: 'Score breakdown returned.' })
  getMyScore(@Req() req: Request & { user: AuthUser }) {
    return this.attendaceService.getUserScore(req.user.id);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get current logged-in user profile' })
  @ApiResponse({ status: 200, description: 'User data returned successfully' })
  @ApiResponse({ status: 404, description: 'User not found in database' })
  async getProfile(@Req() req: Request) {
    const userId = req.user.id;
    
    const user = await this.usersService.findById(userId);
    if (!user) {
        throw new NotFoundException('User profile could not be found');
    }
    
    // stripping the password out before returning safely
    const { password, ...safeUser } = user;
    return safeUser;
  }
}
