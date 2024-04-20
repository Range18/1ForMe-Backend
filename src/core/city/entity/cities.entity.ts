import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '#src/common/base.entity';
import { Studio } from '#src/core/studios/entities/studio.entity';
import { Clubs } from '#src/core/clubs/entity/clubs.entity';

@Entity('cities')
export class City extends BaseEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('increment')
  readonly id: number;

  @ApiProperty()
  @Column({ nullable: false })
  name: string;

  @OneToMany(() => Studio, (studio) => studio.city, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  studios?: Studio[];

  @OneToMany(() => Clubs, (club) => club.city, { nullable: true })
  clubs?: Clubs[];
}
