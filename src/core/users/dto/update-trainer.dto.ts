import { ApiProperty } from '@nestjs/swagger';
import { UpdateUserDto } from '#src/core/users/dto/update-user.dto';

export class UpdateTrainerDto extends UpdateUserDto {
  @ApiProperty({ nullable: true, required: false })
  tax?: number;

  @ApiProperty({ nullable: true, required: false })
  studios?: number[];

  @ApiProperty({ nullable: true, required: false })
  category?: number;

  @ApiProperty({ nullable: true, required: false })
  readonly experience?: number;

  @ApiProperty({ nullable: true, required: false })
  readonly description?: string;

  @ApiProperty({ nullable: true, required: false })
  readonly whatsApp?: string;

  @ApiProperty({ nullable: true, required: false })
  readonly link?: string;

  readonly isActive?: boolean;

  readonly sports?: number[];
}
