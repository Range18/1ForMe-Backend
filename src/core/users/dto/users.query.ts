import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Roles } from '#src/core/roles/types/roles.enum';

export class UsersQuery {
  @IsEnum(Roles)
  @IsString()
  @IsOptional()
  role?: Roles;
}
