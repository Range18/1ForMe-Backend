import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ChatTypes } from '#src/core/chat-types/entities/chat-type.entity';

@Entity('wazzup_messaging_settings')
export class WazzupMessagingSettings {
  @PrimaryGeneratedColumn('increment')
  readonly id: number;

  @Column({ nullable: false })
  notificationPhone: string;

  @ManyToOne(() => ChatTypes, {
    nullable: false,
  })
  @JoinColumn({ name: 'messagingService' })
  messagingService: ChatTypes;
}
