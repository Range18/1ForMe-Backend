import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '#src/core/users/user.entity';
import { BaseEntity } from '#src/common/base.entity';

@Entity('studios')
export class Studio extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  readonly id: number;

  @Column({ nullable: false })
  name: string;

  @OneToMany(() => UserEntity, (user) => user.studio, { nullable: true })
  coaches: UserEntity[];
}
