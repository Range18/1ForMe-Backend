import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatTypes } from '#src/core/chat-types/entities/chat-type.entity';
import { Repository } from 'typeorm';
import { BaseEntityService } from '#src/common/base-entity.service';
import { ApiException } from '#src/common/exception-handler/api-exception';
import { AllExceptions } from '#src/common/exception-handler/exeption-types/all-exceptions';
import EntityExceptions = AllExceptions.EntityExceptions;

@Injectable()
export class ChatTypesService extends BaseEntityService<
  ChatTypes,
  'EntityExceptions'
> {
  constructor(
    @InjectRepository(ChatTypes)
    private readonly chatTypeRepository: Repository<ChatTypes>,
  ) {
    super(
      chatTypeRepository,
      new ApiException<'EntityExceptions'>(
        HttpStatus.NOT_FOUND,
        'EntityExceptions',
        EntityExceptions.NotFound,
      ),
    );
  }
}
