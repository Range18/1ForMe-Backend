import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserComment } from '#src/core/comments/entity/comment.entity';
import { UserEntity } from '#src/core/users/entity/user.entity';
import { CommentsService } from '#src/core/comments/comments.service';
import { CommentsController } from '#src/core/comments/comments.controller';
import { UserModule } from '#src/core/users/user.module';
import { SessionModule } from '#src/core/session/session.module';
import { TokenModule } from '#src/core/token/token.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserComment, UserEntity]),
    UserModule,
    SessionModule,
    TokenModule,
  ],
  providers: [CommentsService],
  controllers: [CommentsController],
  exports: [CommentsService],
})
export class CommentsModule {}
