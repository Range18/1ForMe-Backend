import { PaymentStatus } from '../enums/payment-status.enum';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class PaymentNotificationDto {
  @IsNotEmpty()
  @IsString()
  TerminalKey: string;

  @IsNotEmpty()
  @IsNumber()
  Amount: number;

  @IsNotEmpty()
  @IsString()
  OrderId: string;

  @IsNotEmpty()
  @IsBoolean()
  Success: boolean;

  @IsNotEmpty()
  @IsEnum(PaymentStatus)
  Status: PaymentStatus;

  @IsNotEmpty()
  @IsNumber()
  PaymentId: number;

  @IsNotEmpty()
  @IsString()
  ErrorCode: string;

  @IsNotEmpty()
  @IsString()
  Message: string;

  @IsNotEmpty()
  @IsString()
  Details: string;

  @IsOptional()
  @IsString()
  RebillId: string;

  @IsNotEmpty()
  @IsNumber()
  CardId: number;

  @IsNotEmpty()
  @IsString()
  Pan: string;

  @IsNotEmpty()
  @IsString()
  ExpDate: string;

  @IsNotEmpty()
  @IsString()
  Token: string;

  @IsOptional()
  @IsObject()
  DATA?: Record<string, string>;
}
