import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '#src/common/base.entity';
import { Exclude } from 'class-transformer';
import { Studio } from '#src/core/studios/entities/studio.entity';

@Entity('cities')
export class City extends BaseEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('increment')
  readonly id: number;

  @ApiProperty({ uniqueItems: true })
  @Column({ nullable: false, unique: true })
  name: string;

  @Exclude()
  @OneToMany(() => Studio, (studio) => studio.city, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  studios?: Studio[];
}
