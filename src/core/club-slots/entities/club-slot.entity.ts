import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '#src/common/base.entity';
import { Training } from '#src/core/trainings/entities/training.entity';
import { Slot } from '#src/core/trainer-slots/entities/slot.entity';
import { Studio } from '#src/core/studios/entities/studio.entity';

@Entity('club_slots')
export class ClubSlots extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  readonly id: number;

  @Column({ nullable: false })
  beginning: string;

  @Column({ nullable: false })
  end: string;

  @Column({ nullable: true, type: 'time' })
  beginningTime: string;

  @Column({ nullable: true, type: 'time' })
  endingTime: string;

  @ManyToOne(() => Studio, (studio) => studio.studioSlots, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'studio' })
  studio?: Studio;

  @OneToMany(() => Slot, (slot) => slot.beginning, { nullable: true })
  trainerSlotsStart?: Slot[];

  @OneToMany(() => Slot, (slot) => slot.end, { nullable: true })
  trainerSlotsEnd?: Slot[];

  @OneToMany(() => Training, (training) => training.slot, { nullable: true })
  trainings?: Training[];
}
