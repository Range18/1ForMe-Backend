import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Tariff } from '#src/core/tariffs/entity/tariff.entity';
import { BaseEntity } from '#src/common/base.entity';

@Entity('gift_cards')
export class GiftCard extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  position: number;

  @ManyToOne(() => Tariff, {
    nullable: false,
    eager: true,
    onDelete: 'CASCADE',
  })
  tariff: Tariff;
}
