import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '#src/common/base.entity';
import { UserEntity } from '#src/core/users/entity/user.entity';
import { type NormalizedChatType } from '#src/core/chat-types/types/chat.type';

@Entity('chat_types')
export class ChatTypes extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  readonly id: number;

  @Column({ nullable: false })
  name: NormalizedChatType;

  @OneToMany(() => UserEntity, (user) => user.chatType, { nullable: true })
  users?: UserEntity[];
}
