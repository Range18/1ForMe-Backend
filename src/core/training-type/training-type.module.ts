import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainingType } from '#src/core/training-type/entity/training-type.entity';
import { TrainingTypeService } from '#src/core/training-type/training-type.service';
import { TrainingTypeController } from '#src/core/training-type/training-type.controller';
import { Training } from '#src/core/trainings/entities/training.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TrainingType, Training])],
  providers: [TrainingTypeService],
  controllers: [TrainingTypeController],
  exports: [TrainingTypeService],
})
export class TrainingTypeModule {}
