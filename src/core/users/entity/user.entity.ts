import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SessionEntity } from '../../session/session.entity';
import { BaseEntity } from '#src/common/base.entity';
import { RolesEntity } from '#src/core/roles/entity/roles.entity';
import { Studio } from '#src/core/studios/entities/studio.entity';
import { AssetEntity } from '#src/core/assets/entities/asset.entity';
import { Category } from '#src/core/categories/entity/categories.entity';
import { Tariff } from '#src/core/tariffs/entity/tariff.entity';
import { Training } from '#src/core/trainings/entities/training.entity';
import { UserComment } from '#src/core/comments/entity/comment.entity';
import { Transaction } from '#src/core/transactions/entities/transaction.entity';
import { Code } from '#src/core/verification-codes/entity/verification-codes.entity';
import { Subscription } from '#src/core/subscriptions/entities/subscription.entity';

@Entity('users')
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  readonly id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  surname: string;

  @Column({ nullable: true, unique: true })
  phone: string;

  @Column({ nullable: false })
  password: string;

  @Column({ nullable: false, default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  birthday?: Date;

  @ManyToOne(() => RolesEntity, (role) => role.users, {
    nullable: false,
  })
  @JoinColumn({ name: 'role' })
  role: RolesEntity;

  @OneToOne(() => AssetEntity, (avatar) => avatar.user, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'avatar' })
  avatar?: AssetEntity;

  @OneToOne(() => Code, (code) => code.user, {
    nullable: true,
  })
  verificationCode?: Code;

  @ManyToMany(() => UserEntity, (trainer) => trainer.clients)
  trainers?: UserEntity[];

  @OneToMany(() => SessionEntity, (session) => session.user, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  sessions?: SessionEntity[];

  @OneToMany(() => Training, (training) => training.client, { nullable: true })
  trainingsAsClient?: Training[];

  @OneToMany(() => UserComment, (comment) => comment.client, {
    nullable: true,
  })
  relatedComments?: UserComment[];

  @OneToMany(() => Transaction, (transaction) => transaction.client, {
    nullable: true,
  })
  transactions?: Transaction[];

  @OneToMany(() => Subscription, (subs) => subs.client, {
    nullable: true,
  })
  subsAsClient?: Subscription[];

  //Only for trainers
  @Column({ nullable: true })
  whatsApp?: string;

  @Column({ nullable: true })
  link?: string;

  @Column({ nullable: true })
  tax?: number;

  @Column({ nullable: true })
  experience?: number;

  @Column({ nullable: true })
  description?: string;

  //relations connected only to trainer
  @ManyToOne(() => Category, (category) => category.users, { nullable: true })
  @JoinColumn({ name: 'category' })
  category?: Category;

  @ManyToOne(() => Studio, (studio) => studio.trainers, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'studio' })
  studio?: Studio;

  @OneToMany(() => Tariff, (tariff) => tariff.user, { nullable: true })
  tariffs?: Tariff[];

  @ManyToMany(() => UserEntity, (client) => client.trainers)
  @JoinTable({
    name: 'clients-to-trainers',
    joinColumn: { name: 'client' },
    inverseJoinColumn: { name: 'trainer' },
  })
  clients?: UserEntity[];

  @OneToMany(() => Training, (training) => training.trainer, { nullable: true })
  trainingsAsTrainer?: Training[];

  //comments about users
  @OneToMany(() => UserComment, (comment) => comment.trainer, {
    nullable: true,
  })
  commentsAboutClients?: UserComment[];

  //transactions
  @OneToMany(() => Transaction, (transaction) => transaction.trainer, {
    nullable: true,
  })
  transactionsFromClients?: Transaction[];

  //subscriptions
  @OneToMany(() => Subscription, (subs) => subs.trainer, {
    nullable: true,
  })
  subsAsTrainer?: Subscription[];
}
