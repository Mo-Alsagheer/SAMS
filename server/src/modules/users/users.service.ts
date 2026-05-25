import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { AuditLogService } from '../audit-log/audit-log.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly audit: AuditLogService,
  ) {}

  findByEmail(email: string): Promise<User | null> {
    this.audit
      .log({ action: 'UsersService.findByEmail', body: { email } })
      .catch(() => undefined);
    return this.userRepository.findOne({ where: { email } });
  }

  findById(id: number): Promise<User | null> {
    this.audit
      .log({ action: 'UsersService.findById', body: { id } })
      .catch(() => undefined);
    return this.userRepository.findOne({ where: { id } });
  }

  list(): Promise<User[]> {
    this.audit.log({ action: 'UsersService.list' }).catch(() => undefined);
    return this.userRepository.find();
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    this.audit
      .log({ action: 'UsersService.update', body: { id, updateUserDto } })
      .catch(() => undefined);

    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async changePassword(
    id: number,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.oldPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid old password');
    }

    if (changePasswordDto.oldPassword === changePasswordDto.newPassword) {
      throw new BadRequestException(
        'New password must be different from the old password',
      );
    }

    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
    user.password = hashedPassword;
    await this.userRepository.save(user);

    this.audit
      .log({ action: 'UsersService.changePassword', body: { id } })
      .catch(() => undefined);
  }
}
