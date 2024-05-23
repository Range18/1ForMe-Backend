import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '#src/common/base.entity';
import { UserEntity } from '#src/core/users/entity/user.entity';

@Entity('chat_types')
export class ChatTypes extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  readonly id: number;

  @Column({ nullable: false })
  name: string;

  @OneToMany(() => UserEntity, (user) => user.chatType, { nullable: true })
  users?: UserEntity[];
}
