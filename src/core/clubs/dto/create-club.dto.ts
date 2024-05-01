import { ApiProperty } from '@nestjs/swagger';

export class CreateClubDto {
  @ApiProperty()
  readonly name: string;

  @ApiProperty()
  readonly address: string;

  @ApiProperty()
  readonly studio: number;

  @ApiProperty()
  readonly city: number;

  @ApiProperty({ nullable: true })
  startTime?: string;

  @ApiProperty({ nullable: true })
  endTime?: string;
}
