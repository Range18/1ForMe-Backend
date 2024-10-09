import { IsBoolean, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class CancelTrainingQuery {
  @IsBoolean()
  @Transform(({ value }) => value == 'true')
  @IsOptional()
  allRepeated?: boolean;
}
