import { PaymentStatus } from '../enums/payment-status.enum';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class PaymentNotificationDto {
  @IsNotEmpty()
  @IsString()
  TerminalKey: string;

  @IsNotEmpty()
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
