import { Role } from '../../common/constants/role.enum';

export interface UserRecord {
  id: number;
  name: string;
  email: string;
  password: string;
  role: Role;
}
