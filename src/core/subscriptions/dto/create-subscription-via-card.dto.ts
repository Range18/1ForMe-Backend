import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateSubscriptionViaCardDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsNumber()
  @IsNotEmpty()
  chatTypeId: number;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsNotEmpty()
  giftCardId: string;

  @IsNumber()
  @IsNotEmpty()
  trainingTypeId: number;

  @IsNumber()
  @IsNotEmpty()
  trainerCategoryId: number;

  @IsBoolean()
  @IsNotEmpty()
  isRenewable: boolean;
}
