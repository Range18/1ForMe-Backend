import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '#src/core/users/user.entity';
import { BaseEntity } from '#src/common/base.entity';

@Entity('studios')
export class Studio extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  readonly id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  tax: number;

  @Column({ nullable: false })
  address: string;

  @OneToMany(() => UserEntity, (trainer) => trainer.studio, { nullable: true })
  trainers?: UserEntity[];
}
