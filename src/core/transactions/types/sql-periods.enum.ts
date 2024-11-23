export enum SqlPeriodsEnum {
  day = 'DAY(COALESCE(training.date, subTrainings.firstTrainingDate))',
  week = 'WEEK(COALESCE(training.date, subTrainings.firstTrainingDate),1)',
  month = 'MONTH(COALESCE(training.date, subTrainings.firstTrainingDate))',
}
