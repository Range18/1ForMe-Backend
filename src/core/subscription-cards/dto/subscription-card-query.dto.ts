import { IsNotEmpty, IsNumber } from 'class-validator';

export class SubscriptionCardQueryDto {
  @IsNumber()
  @IsNotEmpty()
  trainingTypeId: number;

  @IsNumber()
  @IsNotEmpty()
  TrainerCategoryId: number;
}
