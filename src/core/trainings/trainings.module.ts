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

@Module({
  imports: [
    TypeOrmModule.forFeature([Training, TrainingType, Sport]),
    UserModule,
    SessionModule,
    TokenModule,
  ],
  controllers: [TrainingsController],
  providers: [TrainingsService],
})
export class TrainingsModule {}
