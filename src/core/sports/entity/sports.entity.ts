import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '#src/common/base.entity';
import { Exclude } from 'class-transformer';
import { Studio } from '#src/core/studios/entities/studio.entity';
import { Tariff } from '#src/core/tariffs/entity/tariff.entity';
import { UserEntity } from '#src/core/users/entity/user.entity';

@Entity('sports')
export class Sport extends BaseEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('increment')
  readonly id: number;

  @ApiProperty({ uniqueItems: true })
  @Column({ nullable: false, unique: true })
  name: string;

  @Exclude()
  @ManyToMany(() => Studio, (studio) => studio.sports, { nullable: false })
  @JoinTable({
    name: 'sports_to_studios',
    joinColumn: { name: 'sport', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'studio', referencedColumnName: 'id' },
  })
  studios?: Studio[];

  @OneToMany(() => Tariff, (tariff) => tariff.sport, {
    nullable: true,
  })
  tariffs?: Tariff[];

  @OneToMany(() => UserEntity, (user) => user.sports, {
    nullable: true,
  })
  trainers?: UserEntity[];
}
