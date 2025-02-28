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
import { GiftCard } from '#src/core/gift-cards/entities/gift-card.entity';

@Entity('gifts')
export class Gift extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @ManyToOne(() => UserEntity, {
    nullable: false,
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  sender: UserEntity;

  @ManyToOne(() => UserEntity, {
    nullable: false,
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  recipient: UserEntity;

  @OneToOne(() => Transaction, {
    nullable: false,
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  transaction: Transaction;

  @ManyToOne(() => GiftCard, {
    nullable: false,
    eager: true,
    onDelete: 'NO ACTION',
  })
  @JoinColumn()
  giftCard: GiftCard;

  @Column({ nullable: false, default: false })
  isActive: boolean;

  @Column({ nullable: false, unique: true })
  promoCode: string;

  @Column({ nullable: true })
  message?: string;

  @Column({ nullable: true })
  sendAt?: Date;
}
