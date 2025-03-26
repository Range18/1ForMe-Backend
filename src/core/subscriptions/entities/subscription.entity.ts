import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '#src/core/users/entity/user.entity';
import { BaseEntity } from '#src/common/base.entity';
import { Training } from '#src/core/trainings/entities/training.entity';
import { Transaction } from '#src/core/transactions/entities/transaction.entity';
import { Category } from '#src/core/categories/entity/categories.entity';
import { TrainingType } from '#src/core/training-type/entity/training-type.entity';

@Entity()
export class Subscription extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  readonly id: number;

  @ManyToOne(() => UserEntity, (user) => user.subsAsClient, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'client' })
  client: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.subsAsTrainer, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'trainer' })
  trainer?: UserEntity;

  @OneToMany(() => Training, (training) => training.subscription, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  trainings?: Training[];

  @OneToOne(() => Transaction, (transaction) => transaction.subscription, {
    nullable: false,
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'transaction' })
  transaction: Transaction;

  @ManyToOne(() => Category, {
    nullable: true,
  })
  category?: Category;

  @ManyToOne(() => TrainingType, {
    nullable: true,
  })
  trainingType?: TrainingType;

  @Column({ nullable: false, default: false })
  isRenewable: boolean;

  @Column({ type: 'date', nullable: true })
  expireAt?: Date;
}
