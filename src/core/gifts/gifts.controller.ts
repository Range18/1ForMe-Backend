import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { GiftsService } from './gifts.service';
import { CreateGiftDto } from './dto/create-gift.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Gifts')
@Controller('api/gifts')
export class GiftsController {
  constructor(private readonly giftsService: GiftsService) {}

  @Post()
  async create(@Body() createGiftDto: CreateGiftDto) {
    return await this.giftsService.create(createGiftDto);
  }

  @Get()
  async findAll() {
    return this.giftsService.formatToDto(await this.giftsService.find({}));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.giftsService.formatToDto(
      await this.giftsService.findOne({ where: { id } }),
    );
  }
}
