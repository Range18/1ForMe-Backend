import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '#src/common/base.entity';
import { Clubs } from '#src/core/clubs/entity/clubs.entity';

@Entity('club_slots')
export class ClubSlots extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  readonly id: number;

  @Column({ nullable: false })
  beginning: string;

  @Column({ nullable: false })
  end: string;

  @ManyToOne(() => Clubs, (club) => club.slots, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'club' })
  club: Clubs;
}
