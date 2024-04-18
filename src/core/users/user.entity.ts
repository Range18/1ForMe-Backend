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
import { SessionEntity } from '../session/session.entity';
import { BaseEntity } from '#src/common/base.entity';
import { RolesEntity } from '#src/core/roles/entity/roles.entity';
import { Studio } from '#src/core/studios/entities/studio.entity';
import { AssetEntity } from '#src/core/assets/entities/asset.entity';
import { Category } from '#src/core/categories/entity/categories.entity';

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

  @ManyToMany(() => UserEntity, (trainer) => trainer.clients, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  trainers?: UserEntity[];

  @OneToMany(() => SessionEntity, (session) => session.user, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  sessions?: SessionEntity[];

  //Only for trainers
  @Column({ nullable: true })
  whatsApp?: string;

  @Column({ nullable: true })
  link?: string;

  @Column({ nullable: true })
  experience?: number;

  @Column({ nullable: true })
  description?: string;

  @ManyToOne(() => Category, (category) => category.users, { nullable: true })
  @JoinColumn({ name: 'category' })
  category?: Category;

  @ManyToOne(() => Studio, (studio) => studio.trainers, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  studio?: Studio;

  @ManyToMany(() => UserEntity, (client) => client.trainers, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinTable({
    name: 'clients-to-trainers',
    joinColumn: { name: 'client' },
    inverseJoinColumn: { name: 'trainer' },
  })
  clients?: UserEntity[];
}
