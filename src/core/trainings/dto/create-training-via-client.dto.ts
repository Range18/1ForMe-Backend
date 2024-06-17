import { ApiProperty } from '@nestjs/swagger';
import { CreateClientDto } from '#src/core/users/dto/create-client.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateTrainingViaClientDto {
  @ApiProperty()
  readonly slot: number;

  @ApiProperty()
  readonly date: Date;

  @ApiProperty({ type: [Number] })
  readonly client: number[];

  @ApiProperty()
  readonly club: number;

  readonly tariff: number;

  readonly trainerId: number;

  readonly createClient?: CreateClientDto;

  @IsBoolean()
  @Transform(({ ...value }) => String(value) == 'true')
  @IsOptional()
  isRepeated?: boolean;
}
