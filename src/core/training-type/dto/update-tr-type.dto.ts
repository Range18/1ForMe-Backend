import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateTrainingTypeDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  readonly name?: string;
}
