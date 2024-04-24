import { ApiProperty } from '@nestjs/swagger';

export class CreateStudioDto {
  @ApiProperty()
  readonly name: string;

  @ApiProperty({ nullable: true, required: false })
  readonly address?: string;

  @ApiProperty()
  readonly city: number;

  //TODO
  // readonly sports: number[];
}
