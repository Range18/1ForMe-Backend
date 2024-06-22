import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiHeader } from '@nestjs/swagger';
import { IsFromWazzupGuardClass } from '#src/common/guards/is-from-wazzup.guard';

export const IsFromWazzupGuard = () => {
  return applyDecorators(
    ApiHeader({
      name: 'Authorization',
      required: true,
      schema: { format: 'Bearer ${CrmToken}' },
    }),
    UseGuards(IsFromWazzupGuardClass),
  );
};
