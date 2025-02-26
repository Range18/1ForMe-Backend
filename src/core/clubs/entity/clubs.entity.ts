import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '#src/common/base.entity';
import { Studio } from '#src/core/studios/entities/studio.entity';
import { City } from '#src/core/city/entity/cities.entity';
import { Training } from '#src/core/trainings/entities/training.entity';
import { Tariff } from '#src/core/tariffs/entity/tariff.entity';

@Entity('clubs')
export class Clubs extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  readonly id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  address: string;

  @ManyToOne(() => Studio, (studio) => studio.clubs, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'studio' })
  studio?: Studio;

  @ManyToOne(() => City, (city) => city.clubs, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'city' })
  city?: City;

  @OneToMany(() => Training, (training) => training.club, {
    nullable: true,
  })
  trainings?: Training[];

  @ManyToMany(() => Tariff, (tariff) => tariff.clubs, {
    nullable: true,
    eager: true,
  })
  @JoinTable({
    name: 'clubs_tariffs',
    joinColumn: { name: 'clubId' },
    inverseJoinColumn: { name: 'tariffId' },
  })
  tariffs?: Tariff[];
}
