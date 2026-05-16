import { Role } from '../../common/constants/role.enum';

export interface AuthUser {
  id: number;
  email: string;
  role: Role;
  committeeId?: number | null;
  name: string;
}
