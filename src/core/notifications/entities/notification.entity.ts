import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '#src/common/base.entity';

@Entity('notifications')
export class Notification extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  //TODO: add types
  @Column({ nullable: false })
  relatedEntity: string;

  @Column({ nullable: false })
  relatedEntityId: string;

  @Column({ nullable: false })
  notificationType: string;

  @Column({ nullable: false })
  time: Date;
}
