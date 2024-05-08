export class TrainingCountPerDateRdo {
  day: number;
  month: number;
  trainingCount: number;

  constructor(trainingCount: string, day: number, month: number) {
    this.trainingCount = Number.parseInt(trainingCount);
    this.day = day;
    this.month = month;
  }
}
