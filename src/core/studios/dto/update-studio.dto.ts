import { ApiProperty } from '@nestjs/swagger';

export class UpdateStudioDto {
  @ApiProperty({ nullable: true, required: false })
  readonly name?: string;

  @ApiProperty({ nullable: true, required: false })
  readonly tax?: number;

  @ApiProperty({ nullable: true, required: false })
  readonly address?: string;
}
