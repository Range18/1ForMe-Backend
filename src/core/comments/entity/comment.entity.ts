import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '#src/common/base.entity';
import { UserEntity } from '#src/core/users/entity/user.entity';

@Entity('user_comments')
export class UserComment extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  readonly id: number;

  @Column({ type: 'longtext', nullable: false })
  text: string;

  @ManyToOne(() => UserEntity, (user) => user.relatedComments, {
    nullable: false,
  })
  customer: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.commentsAboutCustomers, {
    nullable: false,
  })
  trainer: UserEntity;
}
