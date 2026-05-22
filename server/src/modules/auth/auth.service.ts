import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { AuthUser } from './auth.types';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly audit: AuditLogService,
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
}
