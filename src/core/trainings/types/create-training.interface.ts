export interface ICreateTraining {
  slot: number;
  date: Date;
  client?: number[];
  club: number;
  tariff: number;
  isRepeated?: boolean;
}
