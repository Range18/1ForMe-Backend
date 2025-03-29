import { ClubSlots } from '#src/core/studio-slots/entities/club-slot.entity';
import { UserEntity } from '#src/core/users/entity/user.entity';
import { Tariff } from '#src/core/tariffs/entity/tariff.entity';
import { Clubs } from '#src/core/clubs/entity/clubs.entity';
import { Transaction } from '#src/core/transactions/entities/transaction.entity';
import { ICreateTraining } from '#src/core/trainings/types/create-training.interface';

export class CreateTrainingPayload {
  dto: ICreateTraining;

  client: UserEntity;

  trainer: UserEntity;

  slot: ClubSlots;

  tariff: Tariff;

  club: Clubs;

  clientIds: number[];

  clientOrder: number;

  paymentURL?: string;

  transaction?: Transaction;

  invitingClient?: UserEntity;

  constructor(
    dto: ICreateTraining,
    client: UserEntity,
    trainer: UserEntity,
    slot: ClubSlots,
    tariff: Tariff,
    club: Clubs,
    clientIds: number[],
    clientOrder: number,
    paymentURL?: string,
    transaction?: Transaction,
    invitingClient?: UserEntity,
  ) {
    this.dto = dto;
    this.client = client;
    this.trainer = trainer;
    this.slot = slot;
    this.tariff = tariff;
    this.club = club;
    this.clientIds = clientIds;
    this.clientOrder = clientOrder;
    this.paymentURL = paymentURL;
    this.transaction = transaction;
    this.invitingClient = invitingClient;
  }
}
