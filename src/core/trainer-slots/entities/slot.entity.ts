import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '#src/common/base.entity';
import { UserEntity } from '#src/core/users/entity/user.entity';
import { Studio } from '#src/core/studios/entities/studio.entity';
import { ClubSlots } from '#src/core/studio-slots/entities/club-slot.entity';

//TODO: Add Unique constraint
@Entity('trainer_slots')
export class Slot extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  readonly id: number;

  @ManyToOne(() => ClubSlots, (slot) => slot.trainerSlotsStart, {
    nullable: false,
  })
  @JoinColumn({ name: 'beginning' })
  beginning: ClubSlots;

  @ManyToOne(() => ClubSlots, (slot) => slot.trainerSlotsEnd, {
    nullable: false,
  })
  @JoinColumn({ name: 'end' })
  end: ClubSlots;

  @Column({ nullable: false })
  day: number;

  @Column({ type: 'date', nullable: false })
  date: Date;

  @ManyToOne(() => UserEntity, (user) => user.slots, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'trainer' })
  trainer: UserEntity;

  @ManyToOne(() => Studio, (studio) => studio.slots, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'studio' })
  studio: Studio;
}
