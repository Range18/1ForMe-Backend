import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSlotDto {
  @IsString()
  @IsNotEmpty()
  beginning: string;

  @IsString()
  @IsNotEmpty()
  end: string;

  @IsNotEmpty()
  date: Date;

  @ApiProperty()
  studio: number;
}
