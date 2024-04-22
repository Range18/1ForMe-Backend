import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateCommentDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  readonly text?: string;
}
