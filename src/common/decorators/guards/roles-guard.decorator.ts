import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { RolesGuardClass } from '#src/common/guards/roles.guard';

export const RolesGuard = (...roles: string[]) => {
  return applyDecorators(
    SetMetadata(ROLES_METADATA_KEY, roles),
    UseGuards(RolesGuardClass),
  );
};

export const ROLES_METADATA_KEY = 'roles';
