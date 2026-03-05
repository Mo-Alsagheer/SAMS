import { Role } from '../../common/constants/role.enum';

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  name: string;
}
