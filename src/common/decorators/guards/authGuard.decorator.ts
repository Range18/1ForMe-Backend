import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuardClass } from '#src/common/guards/auth.guard';
import { ApiHeader } from '@nestjs/swagger';

export const AuthGuard = () => {
  return applyDecorators(
    ApiHeader({
      name: 'Authorization',
      required: true,
      schema: { format: 'Bearer ${AccessToken}' },
    }),
    UseGuards(AuthGuardClass),
  );
};
