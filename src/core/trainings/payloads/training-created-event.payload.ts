import { Training } from '#src/core/trainings/entities/training.entity';
import { ClubSlots } from '#src/core/studio-slots/entities/club-slot.entity';

export class TrainingCreatedEvent {
  training: Training;

  slot: ClubSlots;

  constructor(training: Training, slot: ClubSlots) {
    this.training = training;
    this.slot = slot;
  }
}
