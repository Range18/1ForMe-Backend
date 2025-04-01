import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class SubscriptionCardQueryDto {
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  trainingTypeId: number;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  TrainerCategoryId: number;
}
