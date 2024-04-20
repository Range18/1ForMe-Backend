import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '#src/common/base.entity';
import { Training } from '#src/core/trainings/entities/training.entity';

@Entity('training_types')
export class TrainingType extends BaseEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('increment')
  readonly id: number;

  @ApiProperty()
  @Column({ nullable: false })
  name: string;

  @OneToMany(() => Training, (training) => training.type, { nullable: true })
  trainings?: Training[];
}
