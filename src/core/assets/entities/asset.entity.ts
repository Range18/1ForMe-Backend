import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '#src/common/base.entity';
import { UserEntity } from '#src/core/users/entity/user.entity';

@Entity('assets')
export class AssetEntity extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  readonly id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  path: string;

  @Column({ nullable: false })
  mimetype: string;

  @OneToOne(() => UserEntity, (user) => user.avatar, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user: UserEntity;
}
