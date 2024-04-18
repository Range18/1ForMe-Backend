import { Module } from '@nestjs/common';
import { StudiosService } from './studios.service';
import { StudiosController } from './studios.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '#src/core/users/user.entity';
import { Studio } from '#src/core/studios/entities/studio.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, Studio])],
  controllers: [StudiosController],
  providers: [StudiosService],
})
export class StudiosModule {}
