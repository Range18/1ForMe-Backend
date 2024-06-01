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
import { Training } from '#src/core/trainings/entities/training.entity';
import { UserComment } from '#src/core/comments/entity/comment.entity';
import { Transaction } from '#src/core/transactions/entities/transaction.entity';
import { Code } from '#src/core/verification-codes/entity/verification-codes.entity';
import { Subscription } from '#src/core/subscriptions/entities/subscription.entity';
import { Slot } from '#src/core/trainer-slots/entities/slot.entity';
import { Sport } from '#src/core/sports/entity/sports.entity';
import { ChatTypes } from '#src/core/chat-types/entities/chat-type.entity';

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

  @Column({ nullable: true })
  userNameInMessenger?: string;

  @ManyToOne(() => ChatTypes, (chatType) => chatType.users, { nullable: true })
  @JoinColumn({ name: 'chatType' })
  chatType?: ChatTypes;

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

  @ManyToMany(() => UserEntity, (trainer) => trainer.clients, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  trainers?: UserEntity[];

  @OneToMany(() => SessionEntity, (session) => session.user, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  sessions?: SessionEntity[];

  @OneToMany(() => Training, (training) => training.client, {
    nullable: true,
  })
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

  @Column({ nullable: true })
  isTrainerActive?: boolean;

  //relations connected only to trainer
  @ManyToOne(() => Category, (category) => category.users, { nullable: true })
  @JoinColumn({ name: 'category' })
  category?: Category;

  @ManyToMany(() => Studio, (studio) => studio.trainers, {
    nullable: true,
  })
  @JoinTable({
    name: 'users_to_studios',
    joinColumn: { name: 'user', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'studio', referencedColumnName: 'id' },
  })
  studios?: Studio[];

  @ManyToMany(() => UserEntity, (client) => client.trainers, {
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'clients-to-trainers',
    joinColumn: { name: 'trainer' },
    inverseJoinColumn: { name: 'client' },
  })
  clients?: UserEntity[];

  @ManyToMany(() => Sport, (sport) => sport.trainers, { nullable: true })
  sports?: Sport[];

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

  //slots
  @OneToMany(() => Slot, (slot) => slot.trainer, {
    nullable: true,
  })
  slots?: Slot[];
}
