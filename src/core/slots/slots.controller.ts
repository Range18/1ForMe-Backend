import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
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
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetSlotRdo } from '#src/core/slots/rdo/get-slot.rdo';
import { type UserRequest } from '#src/common/types/user-request.type';
import { User } from '#src/common/decorators/User.decorator';
import { ClubSlotsService } from '#src/core/club_slots/club-slots.service';
import { ApiException } from '#src/common/exception-handler/api-exception';
import { AllExceptions } from '#src/common/exception-handler/exeption-types/all-exceptions';
import { MoreThanOrEqual } from 'typeorm';
import EntityExceptions = AllExceptions.EntityExceptions;

@ApiTags('Slots')
@Controller('api/slots')
export class SlotsController {
  constructor(
    private readonly slotsService: SlotsService,
    private readonly clubSlotsService: ClubSlotsService,
  ) {}

  @ApiCreatedResponse({ type: GetSlotRdo })
  @ApiBody({ type: CreateSlotDto })
  @AuthGuard()
  @Post()
  async create(
    @Body() createSlotDto: CreateSlotDto,
    @User() user: UserRequest,
  ) {
    const beginningSlot = await this.clubSlotsService.findOne({
      where: { id: createSlotDto.beginning },
    });

    const endSlot = await this.clubSlotsService.findOne({
      where: { id: createSlotDto.end },
    });

    if (!beginningSlot && !endSlot) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'EntityExceptions',
        EntityExceptions.NotFound,
      );
    }
    return await this.slotsService.save({
      beginning: beginningSlot.beginning,
      end: endSlot.end,
      day: createSlotDto.day,
      date: createSlotDto.date,
      studio: { id: createSlotDto.studio },
      trainer: { id: user.id },
    });
  }

  @ApiOkResponse({ type: [GetSlotRdo] })
  @AuthGuard()
  @Get('/my')
  async findAllMy(@User() user: UserRequest) {
    return await this.slotsService.find({
      where: {
        trainer: { id: user.id },
        date: MoreThanOrEqual(new Date()),
      },
      order: { day: 'ASC' },
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
  @AuthGuard()
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateSlotDto: UpdateSlotDto,
    @User() user: UserRequest,
  ) {
    const beginningSlot = await this.clubSlotsService.findOne({
      where: { id: updateSlotDto.beginning },
    });

    const endSlot = await this.clubSlotsService.findOne({
      where: { id: updateSlotDto.end },
    });

    if (!beginningSlot && !endSlot) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'EntityExceptions',
        EntityExceptions.NotFound,
      );
    }

    return await this.slotsService.updateOne(
      {
        where: { id, trainer: { id: user.id } },
        relations: { trainer: true, studio: { city: true } },
      },
      {
        beginning: beginningSlot.beginning,
        end: endSlot.end,
        studio: { id: updateSlotDto.studio },
      },
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return await this.slotsService.remove({ where: { id } });
  }
}
