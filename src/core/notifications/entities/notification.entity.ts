import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '#src/common/base.entity';
import { NotificationTypes } from '#src/core/notifications/types/notification-types.enum';
import { NotificationRelatedEntities } from '#src/core/notifications/types/notification-related-entities.enum';

@Entity('notifications')
export class Notification extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column({ type: 'enum', enum: NotificationRelatedEntities, nullable: false })
  relatedEntity: NotificationRelatedEntities;

  @Column({ nullable: false })
  relatedEntityId: string;

  @Column({ type: 'enum', enum: NotificationTypes, nullable: false })
  notificationType: NotificationTypes;

  @Column({ nullable: false })
  time: Date;
}
