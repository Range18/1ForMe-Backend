import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '#src/core/users/entity/user.entity';
import { Code } from '#src/core/verification-codes/entity/verification-codes.entity';
import { SessionModule } from '#src/core/session/session.module';
import { UserModule } from '#src/core/users/user.module';
import { TokenModule } from '#src/core/token/token.module';
import { VerificationService } from '#src/core/verification-codes/verification.service';
import { VerificationController } from '#src/core/verification-codes/verification.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Code, UserEntity]),
    SessionModule,
    UserModule,
    TokenModule,
  ],
  providers: [VerificationService],
  controllers: [VerificationController],
  exports: [VerificationService],
})
export class VerificationModule {}
