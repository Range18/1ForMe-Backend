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

@Entity('users')
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  readonly id: number;

  @Column({ nullable: false })
  firstname: string;

  @Column({ nullable: false })
  surname: string;

  @Column({ nullable: true, unique: true })
  phone: string;

  @Column({ nullable: false })
  password: string;

  @Column({ nullable: true })
  personalLink?: string;

  @ManyToOne(() => RolesEntity, (role) => role.users, {
    nullable: false,
  })
  @JoinColumn({ name: 'role' })
  role: RolesEntity;

  @OneToMany(() => SessionEntity, (session) => session.user, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  sessions?: SessionEntity[];

  @ManyToOne(() => Studio, (studio) => studio.coaches, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  studio?: Studio;

  @OneToOne(() => AssetEntity, (avatar) => avatar.user, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'avatar' })
  avatar?: AssetEntity;

  @ManyToMany(() => UserEntity, (coach) => coach.clients, {
    nullable: true,
  })
  coaches?: UserEntity[];

  @ManyToMany(() => UserEntity, (client) => client.coaches, {
    nullable: true,
  })
  @JoinTable({
    name: 'clients-to-coaches',
    joinColumn: { name: 'clientId' },
    inverseJoinColumn: { name: 'coachId' },
  })
  clients?: UserEntity[];
}
