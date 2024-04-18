import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '#src/common/base.entity';
import { UserEntity } from '#src/core/users/user.entity';

@Entity('tariffs')
export class Tariff extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  readonly id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  cost: string;

  @ManyToOne(() => UserEntity, (user) => user.tariffs, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user' })
  user: UserEntity;
}
