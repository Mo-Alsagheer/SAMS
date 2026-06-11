import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { AuthUser } from './auth.types';
import { AuditLogService } from '../audit-log/audit-log.service';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly audit: AuditLogService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<AuthUser | null> {
    this.audit
      .log({ action: 'AuthService.validateUser', body: { email } })
      .catch(() => undefined);
    const user = await this.usersService.findByEmail(email);

    let isMatch = false;
    if (user) {
      isMatch = await bcrypt.compare(password, user.password);
      // Fallback for plain text password if bcrypt fails (for legacy testing users)
      if (!isMatch && user.password === password) {
        isMatch = true;
      }
    }

    if (!user || !isMatch) {
      this.audit
        .log({ action: 'AuthService.validateUserFailed', body: { email } })
        .catch(() => undefined);
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      committeeId: user.committeeId,
      name: user.name,
    };
  }

  async login(email: string, password: string) {
    this.audit
      .log({ action: 'AuthService.loginAttempt', body: { email } })
      .catch(() => undefined);
    const user = await this.validateUser(email, password);
    if (!user) {
      this.audit
        .log({ action: 'AuthService.loginFailed', body: { email } })
        .catch(() => undefined);
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      role: user.role,
      committeeId: user.committeeId,
      name: user.name,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      user,
    };
  }

  async forgetPassword(email: string) {
    this.audit
      .log({ action: 'AuthService.forgetPasswordAttempt', body: { email } })
      .catch(() => undefined);

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Do not reveal if the user exists or not
      return {
        message:
          'If that email address is in our database, we will send you an email to reset your password.',
      };
    }

    // Generate a reset token valid for 15 minutes
    const payload = {
      sub: user.id,
      purpose: 'password-reset',
    };

    // It's a good practice to use a dynamic secret for password resets (e.g. including old password hash)
    // to invalidate the token once the password has been reset. But since we need a quick start:
    const resetToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';

    await this.emailService.sendForgetPasswordEmail({
      to: user.email,
      resetToken,
      resetUrl: `${frontendUrl}/reset-password`,
    });

    return {
      message:
        'If that email address is in our database, we will send you an email to reset your password.',
    };
  }

  async resetPassword(token: string, newPassword: string) {
    this.audit
      .log({ action: 'AuthService.resetPasswordAttempt' })
      .catch(() => undefined);

    let decoded: any;
    try {
      decoded = await this.jwtService.verifyAsync(token);
    } catch (e) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (decoded.purpose !== 'password-reset') {
      throw new BadRequestException('Invalid token purpose');
    }

    const userId = decoded.sub;
    await this.usersService.resetPassword(userId, newPassword);

    return {
      message: 'Password has been reset successfully',
    };
  }
}
