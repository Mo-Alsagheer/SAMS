import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Role } from '../../common/constants/role.enum';

@Injectable()
export class ExecutiveService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getDirectorsByCommittee(committeeId: string): Promise<User[]> {
    return this.userRepository.find({
      where: {
        committeeId: committeeId,
        role: Role.DIRECTOR,
      },
      select: ['id', 'name', 'email', 'phone', 'university', 'faculty', 'academicLevel', 'role', 'status']
    });
  }

  async getMembersByCommittee(committeeId: string): Promise<User[]> {
    return this.userRepository.find({
      where: {
        committeeId: committeeId,
        role: Role.USER,
      },
      select: ['id', 'name', 'email', 'phone', 'university', 'faculty', 'academicLevel', 'role', 'status']
    });
  }
}
