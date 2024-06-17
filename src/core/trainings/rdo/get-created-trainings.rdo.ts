import { GetTrainingRdo } from '#src/core/trainings/rdo/get-training.rdo';
import { Training } from '#src/core/trainings/entities/training.entity';

export class GetCreatedTrainingsRdo {
  existingTrainingsDates?: Date[];

  trainings: GetTrainingRdo[];

  constructor(trainings: Training[], existingTrainingsDates?: Date[]) {
    this.existingTrainingsDates = existingTrainingsDates;
    this.trainings = trainings.map((training) => new GetTrainingRdo(training));
  }
}
