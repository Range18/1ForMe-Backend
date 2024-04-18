import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { StudiosService } from './studios.service';
import { CreateStudioDto } from './dto/create-studio.dto';
import { UpdateStudioDto } from './dto/update-studio.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { GetStudioRdo } from '#src/core/studios/rdo/get-studio.rdo';

@ApiTags('Studios')
@Controller('api/studios')
export class StudiosController {
  constructor(private readonly studiosService: StudiosService) {}

  @ApiCreatedResponse({ type: GetStudioRdo })
  @Post()
  async create(@Body() createStudioDto: CreateStudioDto) {
    return new GetStudioRdo(await this.studiosService.save(createStudioDto));
  }

  @ApiOkResponse({ type: [GetStudioRdo] })
  @Get()
  async findAll() {
    const studios = await this.studiosService.find({});

    return studios.map((studio) => new GetStudioRdo(studio));
  }

  @ApiOkResponse({ type: GetStudioRdo })
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return new GetStudioRdo(
      await this.studiosService.findOne({ where: { id } }),
    );
  }

  @ApiOkResponse({ type: GetStudioRdo })
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateStudioDto: UpdateStudioDto,
  ) {
    return new GetStudioRdo(
      await this.studiosService.updateOne({ where: { id } }, updateStudioDto),
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return await this.studiosService.removeOne({ where: { id } });
  }
}
