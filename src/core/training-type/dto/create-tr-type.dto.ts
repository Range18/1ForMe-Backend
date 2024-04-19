import { ApiProperty } from '@nestjs/swagger';

export class CreateTrainingTypeDto {
  @ApiProperty()
  readonly name: string;
}
