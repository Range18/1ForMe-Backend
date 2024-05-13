import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CommentsService } from '#src/core/comments/comments.service';
import { GetCommentRdo } from '#src/core/comments/rdo/get-comment.rdo';
import { CreateCommentDto } from '#src/core/comments/dto/create-comment.dto';
import { UpdateCommentDto } from '#src/core/comments/dto/update-comment.dto';
import { AuthGuard } from '#src/common/decorators/guards/authGuard.decorator';
import { type UserRequest } from '#src/common/types/user-request.type';
import { User } from '#src/common/decorators/User.decorator';

@ApiTags('Comments of users')
@Controller('api/users/:userId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @AuthGuard()
  @ApiCreatedResponse({ type: GetCommentRdo })
  @Post()
  async create(
    @Body() body: CreateCommentDto,
    @Param('userId') clientId: number,
    @User() user: UserRequest,
  ) {
    const comment = await this.commentsService.findOne({
      where: { client: { id: clientId }, trainer: { id: user.id } },
      relations: {
        client: { avatar: true },
      },
    });

    if (comment) {
      comment.text = body.text;
      await this.commentsService.save(comment);

      return new GetCommentRdo(
        await this.commentsService.findOne({
          where: { id: comment.id },
          relations: {
            client: { avatar: true },
          },
        }),
      );
    }

    const commentNew = await this.commentsService.save({
      ...body,
      trainer: { id: user.id },
      client: { id: clientId },
    });

    return new GetCommentRdo(
      await this.commentsService.findOne({
        where: { id: commentNew.id },
        relations: {
          client: { avatar: true },
        },
      }),
    );
  }

  @ApiOkResponse({ type: GetCommentRdo })
  @AuthGuard()
  @Get()
  async get(@Param('userId') clientId: number, @User() user: UserRequest) {
    return new GetCommentRdo(
      await this.commentsService.findOne({
        where: { client: { id: clientId }, trainer: { id: user.id } },
        relations: {
          client: { avatar: true },
        },
      }),
    );
  }

  // TODO PERMS
  @ApiOkResponse({ type: GetCommentRdo })
  @ApiBody({ type: UpdateCommentDto })
  @AuthGuard()
  @Patch()
  async update(
    @Param('id') clientId: number,
    @Body() updateCommentDto: UpdateCommentDto,
    @User() user: UserRequest,
  ) {
    return new GetCommentRdo(
      await this.commentsService.updateOne(
        {
          where: { client: { id: clientId }, trainer: { id: user.id } },
          relations: {
            client: { avatar: true },
          },
        },
        updateCommentDto,
      ),
    );
  }

  // TODO PERMS
  @Delete(':id')
  async delete(@Param('id') id: number) {
    return await this.commentsService.removeOne({ where: { id } });
  }
}
