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

  @Column({ nullable: false, default: true })
  isActive: boolean;

  @Column({ nullable: false, unique: true })
  promoCode: string;

  @Column({ nullable: true })
  message?: string;

  @Column({ nullable: true })
  sendAt?: Date;
}
