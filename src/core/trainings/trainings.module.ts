import { Module } from '@nestjs/common';
import { TrainingsService } from './trainings.service';
import { TrainingsController } from './trainings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Training } from '#src/core/trainings/entities/training.entity';
import { TrainingType } from '#src/core/training-type/entity/training-type.entity';
import { Sport } from '#src/core/sports/entity/sports.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Training, TrainingType, Sport])],
  controllers: [TrainingsController],
  providers: [TrainingsService],
})
export class TrainingsModule {}
