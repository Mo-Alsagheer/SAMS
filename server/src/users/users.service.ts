import { Injectable } from '@nestjs/common';
import { Role } from '../auth/role.enum';
import { UserRecord } from './users.types';

const USERS: UserRecord[] = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    name: 'Uma Applicant',
    email: 'user@example.com',
    password: 'password123',
    role: Role.USER,
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    name: 'Derek Director',
    email: 'director@example.com',
    password: 'password123',
    role: Role.DIRECTOR,
  },
  {
    id: '33333333-3333-4333-8333-333333333333',
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
