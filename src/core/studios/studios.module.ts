import { Module } from '@nestjs/common';
import { StudiosService } from './studios.service';
import { StudiosController } from './studios.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '#src/core/users/entity/user.entity';
import { Studio } from '#src/core/studios/entities/studio.entity';
import { Clubs } from '#src/core/clubs/entity/clubs.entity';
import { City } from '#src/core/city/entity/cities.entity';
import { UserModule } from '#src/core/users/user.module';
import { SessionModule } from '#src/core/session/session.module';
import { TokenModule } from '#src/core/token/token.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, Studio, City, Clubs]),
    UserModule,
    SessionModule,
    TokenModule,
  ],
  controllers: [StudiosController],
  providers: [StudiosService],
  exports: [StudiosService],
})
export class StudiosModule {}
