import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuardClass } from '#src/common/guards/auth.guard';

export const AuthGuard = () => {
  return applyDecorators(UseGuards(AuthGuardClass));
};
