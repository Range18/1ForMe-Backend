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
  @IsString()
  PaymentId: string;

  @IsNotEmpty()
  @IsString()
  ErrorCode: string;

  @IsNotEmpty()
  @IsString()
  Message: string;

  @IsNotEmpty()
  @IsString()
  Details: string;

  @IsNotEmpty()
  @IsString()
  RebillId: string;

  @IsNotEmpty()
  @IsString()
  CardId: string;

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
