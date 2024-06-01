import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '#src/common/base.entity';
import { Tariff } from '#src/core/tariffs/entity/tariff.entity';

@Entity('training_types')
export class TrainingType extends BaseEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('increment')
  readonly id: number;

  @ApiProperty()
  @Column({ nullable: false })
  name: string;

  @OneToMany(() => Tariff, (tariff) => tariff.type, { nullable: true })
  tariffs?: Tariff[];
}
