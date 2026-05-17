import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly audit: AuditLogService,
  ) { }

  findByEmail(email: string): Promise<User | null> {
    this.audit.log({ action: 'UsersService.findByEmail', body: { email } }).catch(() => undefined);
    return this.userRepository.findOne({ where: { email } });
  }

  findById(id: number): Promise<User | null> {
    this.audit.log({ action: 'UsersService.findById', body: { id } }).catch(() => undefined);
    return this.userRepository.findOne({ where: { id } });
  }

  createApplicant(data: Partial<User>): Promise<User> {
    this.audit.log({ action: 'UsersService.createApplicant', body: { email: data.email } }).catch(() => undefined);
    const user = this.userRepository.create(data);
    return this.userRepository.save(user);
  }

  list(): Promise<User[]> {
    this.audit.log({ action: 'UsersService.list' }).catch(() => undefined);
    return this.userRepository.find();
  }
}
