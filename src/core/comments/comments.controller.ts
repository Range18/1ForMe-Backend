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
  ApiHeader,
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
@Controller('api/users/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @ApiHeader({ name: 'Authorization' })
  @AuthGuard()
  @ApiCreatedResponse({ type: GetCommentRdo })
  @Post()
  async create(@Body() body: CreateCommentDto, @User() user: UserRequest) {
    const comment = await this.commentsService.save({
      ...body,
      trainer: { id: user.id },
      customer: { id: body.userId },
    });

    return new GetCommentRdo(
      await this.commentsService.findOne({
        where: { id: comment.id },
        relations: {
          customer: { role: true, avatar: true },
          trainer: { role: true, avatar: true, studio: true, category: true },
        },
      }),
    );
  }

  @ApiOkResponse({ type: [GetCommentRdo] })
  @Get()
  async getAll() {
    const comments = await this.commentsService.find({
      relations: {
        customer: { role: true, avatar: true },
        trainer: { role: true, avatar: true, studio: true, category: true },
      },
    });

    return comments.map((comment) => new GetCommentRdo(comment));
  }

  @ApiOkResponse({ type: GetCommentRdo })
  @Get(':id')
  async get(@Param('id') id: number) {
    return new GetCommentRdo(
      await this.commentsService.findOne({
        where: { id },
        relations: {
          customer: { role: true, avatar: true },
          trainer: { role: true, avatar: true, studio: true, category: true },
        },
      }),
    );
  }

  // TODO PERMS
  @ApiOkResponse({ type: GetCommentRdo })
  @ApiBody({ type: UpdateCommentDto })
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return new GetCommentRdo(
      await this.commentsService.updateOne(
        {
          where: { id },
          relations: {
            customer: { role: true, avatar: true },
            trainer: { role: true, avatar: true, studio: true, category: true },
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
