import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ChatTypesService } from './chat-types.service';
import { CreateChatTypeDto } from './dto/create-chat-type.dto';
import { UpdateChatTypeDto } from './dto/update-chat-type.dto';

@Controller('api/chat-types')
export class ChatTypesController {
  constructor(private readonly chatTypesService: ChatTypesService) {}

  @Post()
  async create(@Body() createChatTypeDto: CreateChatTypeDto) {
    return await this.chatTypesService.save(createChatTypeDto);
  }

  @Get()
  async findAll() {
    return await this.chatTypesService.find({});
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.chatTypesService.findOne({ where: { id } });
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateChatTypeDto: UpdateChatTypeDto,
  ) {
    return await this.chatTypesService.updateOne(
      { where: { id } },
      updateChatTypeDto,
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return await this.chatTypesService.remove({ where: { id } });
  }
}
