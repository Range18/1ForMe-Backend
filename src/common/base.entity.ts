import {
  BaseEntity as TypeOrmBaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

export class BaseEntity extends TypeOrmBaseEntity {
  @Exclude()
  @CreateDateColumn()
  readonly createdAt: Date;

  @Exclude()
  @UpdateDateColumn()
  readonly updatedAt: Date;
}
