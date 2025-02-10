import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '#src/core/users/entity/user.entity';
import { BaseEntity } from '#src/common/base.entity';
import { City } from '#src/core/city/entity/cities.entity';
import { Sport } from '#src/core/sports/entity/sports.entity';
import { Clubs } from '#src/core/clubs/entity/clubs.entity';
import { Slot } from '#src/core/trainer-slots/entities/slot.entity';
import { Tariff } from '#src/core/tariffs/entity/tariff.entity';
import { ClubSlots } from '#src/core/studio-slots/entities/club-slot.entity';

@Entity('studios')
export class Studio extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  readonly id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true })
  address?: string;

  @ManyToMany(() => UserEntity, (trainer) => trainer.studios, {
    nullable: true,
  })
  trainers?: UserEntity[];

  @ManyToOne(() => City, (city) => city.studios, { nullable: false })
  @JoinColumn({ name: 'city' })
  city: City;

  @ManyToMany(() => Sport, (sport) => sport.studios, { nullable: true })
  sports?: Sport[];

  @OneToMany(() => Clubs, (club) => club.studio, { nullable: true })
  clubs?: Clubs[];

  @OneToMany(() => Slot, (slot) => slot.studio, { nullable: true })
  slots?: Slot[];

  @OneToMany(() => ClubSlots, (slot) => slot.studio, {
    nullable: true,
  })
  studioSlots?: ClubSlots[];

  @OneToMany(() => Tariff, (tariff) => tariff.studio, { nullable: true })
  tariffs?: Tariff[];
}
