import { Role } from './role.enum';

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  name: string;
}
