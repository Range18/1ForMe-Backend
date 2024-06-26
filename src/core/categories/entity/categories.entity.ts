import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '#src/core/users/entity/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '#src/common/base.entity';
import { Tariff } from '#src/core/tariffs/entity/tariff.entity';

@Entity('categories')
export class Category extends BaseEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('increment')
  readonly id: number;

  @ApiProperty()
  @Column({ nullable: false })
  name: string;

  @OneToMany(() => UserEntity, (user) => user.category, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  users?: UserEntity[];

  @OneToMany(() => Tariff, (tariff) => tariff.category, {
    nullable: true,
  })
  tariffs?: Tariff[];
}
