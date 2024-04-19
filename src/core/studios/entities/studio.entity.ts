import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '#src/core/users/user.entity';
import { BaseEntity } from '#src/common/base.entity';
import { City } from '#src/core/city/entity/cities.entity';
import { Sport } from '#src/core/sports/entity/sports.entity';

@Entity('studios')
export class Studio extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  readonly id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  tax: number;

  @Column({ nullable: true })
  address?: string;

  @OneToMany(() => UserEntity, (trainer) => trainer.studio, { nullable: true })
  trainers?: UserEntity[];

  @ManyToOne(() => City, (city) => city.studios, { nullable: false })
  @JoinColumn({ name: 'city' })
  city: City;

  @ManyToMany(() => Sport, (sport) => sport.studios, { nullable: false })
  sports?: Sport[];
}
