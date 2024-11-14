import { IsNotEmpty, IsString } from 'class-validator';

export class SignUpToTrainer {
  @IsString()
  @IsNotEmpty()
  link: string;
}
