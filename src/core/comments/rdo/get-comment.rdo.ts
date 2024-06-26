import { GetUserRdo } from '#src/core/users/rdo/get-user.rdo';
import { UserComment } from '#src/core/comments/entity/comment.entity';
import { ApiProperty } from '@nestjs/swagger';

export class GetCommentRdo {
  @ApiProperty()
  readonly id: number;

  @ApiProperty()
  readonly text: string;

  @ApiProperty({ type: () => GetUserRdo })
  readonly trainer: GetUserRdo;

  @ApiProperty({ type: () => GetUserRdo })
  readonly client: GetUserRdo;

  @ApiProperty()
  readonly updatedAt: Date;
  @ApiProperty()
  readonly createdAt: Date;

  constructor(comment: UserComment) {
    this.id = comment.id;
    this.text = comment.text;
    this.client = comment.client ? new GetUserRdo(comment.client) : undefined;
    this.trainer = comment.trainer
      ? new GetUserRdo(comment.trainer)
      : undefined;

    this.createdAt = comment.createdAt;
    this.updatedAt = comment.updatedAt;
  }
}
