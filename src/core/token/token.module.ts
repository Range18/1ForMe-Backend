import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from '../../common/configs/config';
import { TokenService } from './token.service';

@Module({
  imports: [JwtModule.register({ secret: jwtConfig.secret })],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
