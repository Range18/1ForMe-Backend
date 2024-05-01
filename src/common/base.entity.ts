import {
  BaseEntity as TypeOrmBaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Expose } from 'class-transformer';

export class BaseEntity extends TypeOrmBaseEntity {
  @Expose()
  @CreateDateColumn()
  readonly createdAt: Date;

  @Expose()
  @UpdateDateColumn()
  readonly updatedAt: Date;
}
