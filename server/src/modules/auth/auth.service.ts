import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { AuthUser } from './auth.types';
import { AuditLogService } from '../audit-log/audit-log.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly audit: AuditLogService,
    private readonly emailService: EmailService,
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

  async requestPasswordReset(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return { success: true, message: 'If an account with that email exists, a password reset link has been sent.' };
    }

    const resetToken = await this.jwtService.signAsync(
      { sub: user.id, reset: true },
      { expiresIn: '1h' },
    );

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    await this.emailService.sendPasswordResetEmail(user.email, user.name, resetLink);

    return { success: true, message: 'If an account with that email exists, a password reset link has been sent.' };
  }

  async confirmPasswordReset(token: string, newPassword: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token);
      if (!payload.reset || !payload.sub) {
        throw new BadRequestException('Invalid reset token');
      }

      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new BadRequestException('User not found');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      // Note: We need a way to save the user password. 
      // Since usersService might not expose save(), we might need to add it or use an update method.
      await this.usersService.updatePassword(user.id, hashedPassword);

      return { success: true, message: 'Password has been successfully reset.' };
    } catch (e) {
      throw new BadRequestException('Invalid or expired reset token');
    }
  }
}
