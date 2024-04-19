import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '#src/common/base.entity';
import { Studio } from '#src/core/studios/entities/studio.entity';
import { City } from '#src/core/city/entity/cities.entity';

@Entity('clubs')
export class Clubs extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  readonly id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  address: string;

  @ManyToOne(() => Studio, (studio) => studio.sports, {
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
}
