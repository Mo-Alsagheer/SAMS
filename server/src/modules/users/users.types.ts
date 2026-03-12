import { Role } from '../../common/constants/role.enum';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
}
