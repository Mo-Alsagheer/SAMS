import {
  Controller,
  Get,
  Req,
  UseGuards,
  NotFoundException,
  Patch,
  Param,
  Body,
  ParseIntPipe,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBody,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/constants/role.enum';
import { Request } from 'express';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ChangeStatusDto } from './dto/change-status.dto';
import { AuthUser } from '../auth/auth.types';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('committee-members')
  @UseGuards(RolesGuard)
  @Roles(Role.EXECUTIVE, Role.DIRECTOR)
  @ApiOperation({ summary: 'List all committee members with details and scores (Executive/Director)' })
  @ApiResponse({
    status: 200,
    description: 'Committee members returned successfully.',
  })
  async listCommitteeMembers(@Req() req: Request & { user: AuthUser }) {
    return this.usersService.listCommitteeMembers(req.user);
  }

  @Get('committee-members/statistics')
  @UseGuards(RolesGuard)
  @Roles(Role.EXECUTIVE, Role.DIRECTOR)
  @ApiOperation({ summary: 'Get overall statistics for committee members (Executive/Director)' })
  @ApiResponse({
    status: 200,
    description: 'Committee member statistics returned successfully.',
  })
  async getCommitteeMembersStats(@Req() req: Request & { user: AuthUser }) {
    return this.usersService.getCommitteeMembersStats(req.user);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.EXECUTIVE, Role.DIRECTOR)
  @ApiOperation({ summary: 'Change the status of a user (Executive/Director)' })
  @ApiResponse({ status: 200, description: 'User status updated successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiBody({ type: ChangeStatusDto })
  async changeStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() changeStatusDto: ChangeStatusDto,
    @Req() req: Request & { user: AuthUser },
  ) {
    return this.usersService.changeStatus(id, changeStatusDto.status, req.user);
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

    return user;
  }

  @Patch('changePassword')
  @ApiOperation({ summary: 'Change current user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({
    status: 400,
    description: 'User does not have a password set',
  })
  @ApiResponse({ status: 401, description: 'Invalid old password' })
  @ApiBody({ type: ChangePasswordDto })
  async changePassword(
    @Req() req: Request,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    const userId = req.user.id;
    await this.usersService.changePassword(userId, changePasswordDto);
    return { message: 'Password changed successfully' };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user information except password' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found in database' })
  @ApiBody({ type: UpdateUserDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    // Prevent updating password via this endpoint even if accidentally included (though DTO validation strips it if whitelist is true, let's be explicitly safe)
    if ('password' in updateUserDto) {
      delete (updateUserDto as any).password;
    }

    const updatedUser = await this.usersService.update(id, updateUserDto);

    return updatedUser;
  }
}
