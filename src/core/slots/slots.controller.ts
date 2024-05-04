import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { SlotsService } from './slots.service';
import { CreateSlotDto } from './dto/create-slot.dto';
import { UpdateSlotDto } from './dto/update-slot.dto';
import { AuthGuard } from '#src/common/decorators/guards/authGuard.decorator';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiHeader,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetSlotRdo } from '#src/core/slots/rdo/get-slot.rdo';
import { type UserRequest } from '#src/common/types/user-request.type';
import { User } from '#src/common/decorators/User.decorator';

@ApiTags('Slots')
@Controller('api/slots')
export class SlotsController {
  constructor(private readonly slotsService: SlotsService) {}

  @ApiCreatedResponse({ type: GetSlotRdo })
  @ApiBody({ type: CreateSlotDto })
  @ApiHeader({ name: 'Authorization' })
  @AuthGuard()
  @Post()
  async create(
    @Body() createSlotDto: CreateSlotDto,
    @User() user: UserRequest,
  ) {
    return await this.slotsService.save({
      ...createSlotDto,
      studio: { id: createSlotDto.studio },
      trainer: { id: user.id },
    });
  }

  @ApiOkResponse({ type: [GetSlotRdo] })
  @ApiHeader({ name: 'Authorization' })
  @AuthGuard()
  @Get('/my')
  async findAllMy(@User() user: UserRequest) {
    return await this.slotsService.find({
      where: { trainer: { id: user.id } },
      relations: { trainer: true, studio: { city: true } },
    });
  }

  @ApiOkResponse({ type: GetSlotRdo })
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.slotsService.findOne({
      where: { id },
      relations: { trainer: true, studio: { city: true } },
    });
  }

  @ApiOkResponse({ type: GetSlotRdo })
  @ApiBody({ type: UpdateSlotDto })
  @ApiHeader({ name: 'Authorization' })
  @AuthGuard()
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateSlotDto: UpdateSlotDto,
    @User() user: UserRequest,
  ) {
    return await this.slotsService.updateOne(
      {
        where: { id, trainer: { id: user.id } },
        relations: { trainer: true, studio: { city: true } },
      },
      {
        ...updateSlotDto,
        studio: { id: updateSlotDto.studio },
      },
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return await this.slotsService.remove({ where: { id } });
  }
}
