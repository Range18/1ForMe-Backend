import { ApiProperty } from '@nestjs/swagger';
import { CreateClientDto } from '#src/core/users/dto/create-client1.dto';

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
}
