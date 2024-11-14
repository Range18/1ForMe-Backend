import { UpdateUserDto } from '#src/core/users/dto/update-user.dto';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class UpdateTrainerDto extends UpdateUserDto {
  @Max(100)
  @Min(0)
  @IsNumber()
  @IsOptional()
  tax?: number;

  @IsArray()
  @IsOptional()
  studios?: number[];

  @IsNumber()
  @IsOptional()
  category?: number;

  @IsString()
  @IsOptional()
  experience?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  whatsApp?: string;

  @IsString()
  @IsOptional()
  telegramUsername?: string;

  @IsString()
  @IsOptional()
  link?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsArray()
  @IsOptional()
  sports?: number[];
}
