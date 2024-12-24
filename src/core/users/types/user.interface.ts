import { Roles } from '#src/core/roles/types/roles.enum';

export interface IUser {
  name?: string;
  surname?: string;
  role: Roles;
  phone: string;
  password?: string;
}
