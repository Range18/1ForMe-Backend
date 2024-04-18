import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '#src/common/base.entity';
import { Exclude } from 'class-transformer';
import { Studio } from '#src/core/studios/entities/studio.entity';

@Entity('sports')
export class Sport extends BaseEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('increment')
  readonly id: number;

  @ApiProperty({ uniqueItems: true })
  @Column({ nullable: false, unique: true })
  name: string;

  @Exclude()
  @ManyToMany(() => Studio, (studio) => studio.sports, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinTable({
    name: 'sports_to_studios',
    joinColumn: { name: 'sport', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'studio', referencedColumnName: 'id' },
  })
  studios?: Studio[];
}
