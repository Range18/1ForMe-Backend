import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '#src/common/base.entity';
import { Clubs } from '#src/core/clubs/entity/clubs.entity';
import { Training } from '#src/core/trainings/entities/training.entity';
import { Slot } from '#src/core/slots/entities/slot.entity';

@Entity('club-slots')
export class ClubSlots extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  readonly id: number;

  @Column({ nullable: false })
  beginning: string;

  @Column({ nullable: false })
  end: string;

  @ManyToOne(() => Clubs, (club) => club.slots, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'club' })
  club: Clubs;

  @OneToMany(() => Slot, (slot) => slot.beginning, { nullable: true })
  trainerSlotsStart?: Slot[];

  @OneToMany(() => Slot, (slot) => slot.end, { nullable: true })
  trainerSlotsEnd?: Slot[];

  @OneToMany(() => Training, (training) => training.slot, { nullable: true })
  trainings?: Training[];
}
