import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '#src/common/base.entity';
import { UserEntity } from '#src/core/users/entity/user.entity';
import { Transaction } from '#src/core/transactions/entities/transaction.entity';
import { Clubs } from '#src/core/clubs/entity/clubs.entity';
import { Subscription } from '#src/core/subscriptions/entities/subscription.entity';
import { ClubSlots } from '#src/core/club-slots/entities/club-slot.entity';

@Entity()
export class Training extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  readonly id: number;

  @ManyToOne(() => ClubSlots, (slot) => slot.trainings, { nullable: false })
  @JoinColumn({ name: 'slot' })
  slot: ClubSlots;

  @Column({ type: 'date', nullable: false })
  date: Date;

  @Column({ nullable: false, default: false })
  isCanceled: boolean;

  @Column({ nullable: false, default: false })
  isRepeated: boolean;

  @ManyToOne(() => Subscription, (subs) => subs.trainings, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'subscription' })
  subscription?: Subscription;

  @ManyToOne(() => UserEntity, (user) => user.trainingsAsClient, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'client' })
  client: UserEntity;

  @ManyToOne(() => Clubs, (club) => club.trainings, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'club' })
  club: Clubs;

  @ManyToOne(() => UserEntity, (user) => user.trainingsAsTrainer, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'trainer' })
  trainer: UserEntity;

  @OneToOne(() => Transaction, (transaction) => transaction.training, {
    nullable: true,
  })
  @JoinColumn({ name: 'transaction' })
  transaction?: Transaction;
}
