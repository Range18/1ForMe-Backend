import { Module } from '@nestjs/common';
import { ChatTypesService } from './chat-types.service';
import { ChatTypesController } from './chat-types.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatTypes } from '#src/core/chat-types/entities/chat-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChatTypes])],
  controllers: [ChatTypesController],
  providers: [ChatTypesService],
  exports: [ChatTypesService],
})
export class ChatTypesModule {}
