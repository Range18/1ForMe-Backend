import { ApiProperty } from '@nestjs/swagger';

export class VerifyByCodeDto {
  @ApiProperty()
  readonly code: number;
}
