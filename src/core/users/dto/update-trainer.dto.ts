import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';
import { UpdateUserDto } from '#src/core/users/dto/update-user.dto';

export class UpdateTrainerDto extends UpdateUserDto {
  @IsNumber()
  @IsOptional()
  @ApiProperty({ nullable: true, required: false })
  tax?: number;

  @ApiProperty({ nullable: true, required: false })
  studio?: number;

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
}
