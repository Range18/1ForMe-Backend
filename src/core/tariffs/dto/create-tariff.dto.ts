import { ApiProperty } from '@nestjs/swagger';

export class CreateTariffDto {
  @ApiProperty()
  readonly name: string;

  @ApiProperty()
  readonly cost: string;
}
