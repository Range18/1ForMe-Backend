import { RolesEntity } from '#src/core/roles/entity/roles.entity';

export const rolesArray: Pick<RolesEntity, 'name'>[] = [
  { name: 'trainer' },
  { name: 'client' },
];
