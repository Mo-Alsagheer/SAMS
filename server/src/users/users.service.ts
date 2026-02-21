import { Injectable } from '@nestjs/common';
import { Role } from '../auth/role.enum';
import { UserRecord } from './users.types';

const USERS: UserRecord[] = [
  {
    id: '01JMZP1USER000000000000001',
    name: 'Uma Applicant',
    email: 'user@example.com',
    password: 'password123',
    role: Role.USER,
  },
  {
    id: '01JMZP1DIRE000000000000002',
    name: 'Derek Director',
    email: 'director@example.com',
    password: 'password123',
    role: Role.DIRECTOR,
  },
  {
    id: '01JMZP1EXEC000000000000003',
    name: 'Erin Executive',
    email: 'executive@example.com',
    password: 'password123',
    role: Role.EXECUTIVE,
  },
];

@Injectable()
export class UsersService {
  private readonly users = USERS;

  findByEmail(email: string): UserRecord | undefined {
    return this.users.find((user) => user.email === email);
  }

  findById(id: string): UserRecord | undefined {
    return this.users.find((user) => user.id === id);
  }

  list(): UserRecord[] {
    return [...this.users];
  }
}
