import { IsNotEmpty, IsNumber } from 'class-validator';

export class AttachClientDto {
  @IsNumber()
  @IsNotEmpty()
  trainerId: number;
}
