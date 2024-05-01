import { Module } from '@nestjs/common';
import { TrainingsService } from './trainings.service';
import { TrainingsController } from './trainings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Training } from '#src/core/trainings/entities/training.entity';
import { TrainingType } from '#src/core/training-type/entity/training-type.entity';
import { Sport } from '#src/core/sports/entity/sports.entity';
import { UserModule } from '#src/core/users/user.module';
import { SessionModule } from '#src/core/session/session.module';
import { TokenModule } from '#src/core/token/token.module';
import { TransactionsModule } from '#src/core/transactions/transactions.module';
import { TariffsModule } from '#src/core/tariffs/tariffs.module';
import { Tariff } from '#src/core/tariffs/entity/tariff.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Training, TrainingType, Sport, Tariff]),
    UserModule,
    SessionModule,
    TokenModule,
    TransactionsModule,
    TariffsModule,
  ],
  controllers: [TrainingsController],
  providers: [TrainingsService],
  exports: [TrainingsService],
})
export class TrainingsModule {}
