import { Controller, Post, Body, UseGuards, Param, Request, BadRequestException, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { EmailService } from './email.service';
import { TestEmailDto } from './dto/test-email.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/constants/role.enum';
import { ParseIntIdPipe } from '../../common/pipes/parse-int-id.pipe';
import { UsersService } from '../users/users.service';

@ApiTags('email')
@Controller('email')
// @UseGuards(JwtAuthGuard)
// @ApiBearerAuth()
export class EmailController {
  constructor(
    private readonly emailService: EmailService,
    private readonly usersService: UsersService,
  ) { }

  @Post('test')
  @ApiOperation({ summary: 'Send a test email using Resend' })
  @ApiResponse({ status: 200, description: 'Email sent successfully' })
  async sendTestEmail(@Body() dto: TestEmailDto) {
    return this.emailService.sendTestEmail(dto.to);
  }

  @Post('status')
  @ApiOperation({ summary: 'Send application status email' })
  @ApiBody({ schema: { type: 'object', properties: { to: { type: 'string' }, name: { type: 'string' }, status: { type: 'string' }, role: { type: 'string' }, details: { type: 'string' } } } })
  @ApiResponse({ status: 201, description: 'Email sent successfully' })
  async sendApplicationStatusEmail(@Body() body: any) {
    await this.emailService.sendApplicationStatusEmail(body);
    return { success: true };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(Role.EXECUTIVE)
  @Post('broadcast/global')
  @ApiOperation({ summary: 'Broadcast an email to all members in the system' })
  @ApiBody({ schema: { type: 'object', properties: { subject: { type: 'string' }, message: { type: 'string' } } } })
  @ApiResponse({ status: 201, description: 'Broadcast email sent successfully.' })
  async broadcastGlobal(
    @Body() payload: { subject: string; message: string },
    @Request() req: any,
  ) {
    const senderName = req.user?.name || 'Executive';
    const users = await this.usersService.list();
    const emails = users.filter(u => u.role === Role.MEMBER || u.role === Role.DIRECTOR).map(u => u.email);

    if (emails.length === 0) {
      throw new BadRequestException('No members found in the system');
    }

    await this.emailService.sendBroadcastEmail({
      to: emails,
      subject: payload.subject,
      message: payload.message,
      senderName,
    });
    return { success: true, recipientsCount: emails.length };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(Role.DIRECTOR, Role.EXECUTIVE)
  @Post('broadcast/committee/:committeeId')
  @ApiOperation({ summary: 'Broadcast an email to all members of a committee' })
  @ApiParam({ name: 'committeeId', description: 'Numeric committee ID' })
  @ApiBody({ schema: { type: 'object', properties: { subject: { type: 'string' }, message: { type: 'string' } } } })
  @ApiResponse({ status: 201, description: 'Broadcast email sent successfully.' })
  async broadcastCommittee(
    @Param('committeeId', ParseIntIdPipe) committeeId: number,
    @Body() payload: { subject: string; message: string },
    @Request() req: any,
  ) {
    const senderName = req.user?.name || 'Director';
    const users = await this.usersService.list();
    const emails = users.filter(u => u.committeeId === committeeId && u.role === Role.MEMBER).map(u => u.email);

    if (emails.length === 0) {
      throw new BadRequestException('No members found in this committee');
    }

    await this.emailService.sendBroadcastEmail({
      to: emails,
      subject: payload.subject,
      message: payload.message,
      senderName,
    });
    return { success: true, recipientsCount: emails.length };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(Role.EXECUTIVE)
  @Post('terminate/:id')
  @ApiOperation({ summary: 'Terminate a user and send them a termination email' })
  @ApiParam({ name: 'id', description: 'Numeric User ID' })
  @ApiResponse({ status: 201, description: 'User terminated successfully.' })
  async terminateUser(@Param('id', ParseIntIdPipe) id: number) {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.role === Role.EXECUTIVE) {
      throw new BadRequestException('Cannot terminate an Executive user');
    }

    await this.usersService.remove(user.id);
    await this.emailService.sendTerminationEmail(user.email, user.name);
    return { success: true, message: 'User terminated successfully' };
  }
}
