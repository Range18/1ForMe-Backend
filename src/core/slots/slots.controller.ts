import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { SlotsService } from './slots.service';
import { CreateSlotDto } from './dto/create-slot.dto';
import { UpdateSlotDto } from './dto/update-slot.dto';
import { AuthGuard } from '#src/common/decorators/guards/authGuard.decorator';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { GetSlotRdo } from '#src/core/slots/rdo/get-slot.rdo';
import { type UserRequest } from '#src/common/types/user-request.type';
import { User } from '#src/common/decorators/User.decorator';
import { ClubSlotsService } from '#src/core/club_slots/club-slots.service';
import { ApiException } from '#src/common/exception-handler/api-exception';
import { AllExceptions } from '#src/common/exception-handler/exeption-types/all-exceptions';
import { In, MoreThanOrEqual } from 'typeorm';
import { TrainingsService } from '#src/core/trainings/trainings.service';
import { GetClubSlotRdo } from '#src/core/club_slots/rdo/get-club-slot.rdo';
import EntityExceptions = AllExceptions.EntityExceptions;

function range(start: number, stop: number) {
  return [...Array(stop).keys()].map((key) => ++key).splice(start - 1);
}

@ApiTags('Slots')
@Controller('api/slots')
export class SlotsController {
  constructor(
    private readonly slotsService: SlotsService,
    private readonly clubSlotsService: ClubSlotsService,
    private readonly trainingService: TrainingsService,
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
      beginning: beginningSlot,
      end: endSlot,
      day:
        new Date(createSlotDto.date).getDay() === 0
          ? 7
          : new Date(createSlotDto.date).getDay(),
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
        date: MoreThanOrEqual(
          new Date().toISOString().split('T')[0] as unknown as Date,
        ),
      },
      order: { day: 'ASC' },
      relations: { studio: { city: true }, end: true, beginning: true },
    });
  }

  @ApiOkResponse({ type: [GetSlotRdo] })
  @AuthGuard()
  @Get('/my/available')
  async findAllMyAvailable(@User() user: UserRequest) {
    const trainerTime = await this.slotsService.find({
      where: {
        trainer: { id: user.id },
        date: MoreThanOrEqual(
          new Date().toISOString().split('T')[0] as unknown as Date,
        ),
      },
      order: { day: 'ASC' },
      relations: { studio: { city: true }, end: true, beginning: true },
    });

    const slots = await this.clubSlotsService.find({
      relations: { club: { city: true, studio: true } },
      order: { id: 'ASC' },
    });

    const freeSlots = [];

    for (const trainerSlot of trainerTime) {
      const trainings = await this.trainingService.find({
        where: { trainer: { id: user.id }, date: trainerSlot.date },
        relations: { slot: true },
      });
      const trainerClubSlots = [];

      for (const slot of slots) {
        if (
          slot.id >= trainerSlot.beginning.id &&
          slot.id <= trainerSlot.end.id
        ) {
          trainerClubSlots.push(
            new GetClubSlotRdo(
              slot,
              trainings.every((training) => slot.id !== training.slot.id),
            ),
          );
        }
      }

      freeSlots.push({
        date: trainerSlot.date,
        count: trainerClubSlots.reduce(
          (previousValue, currentValue) =>
            previousValue + Number(currentValue.isAvailable),
          0,
        ),
        slots: trainerClubSlots,
      });
    }

    return freeSlots;
  }
  @ApiOkResponse({ type: [GetSlotRdo] })
  @ApiQuery({ name: 'date' })
  @AuthGuard()
  @Get('trainers/:trainerId/available')
  async getAllTrainerTime(
    @User() user: UserRequest,
    @Param('trainerId') trainerId: number,
    @Query('date') date: Date,
  ) {
    const trainings = await this.trainingService.find({
      where: { date: date },
      relations: { slot: true },
    });

    const trainerTime = await this.slotsService.findOne({
      where: {
        trainer: { id: trainerId },
        date: date,
      },
      order: { day: 'ASC' },
      relations: { studio: { city: true }, end: true, beginning: true },
    });

    const slots = await this.clubSlotsService.find({
      where: { id: In(range(trainerTime.beginning.id, trainerTime.end.id)) },
      relations: { club: { city: true, studio: true } },
      order: { id: 'ASC' },
    });

    return slots.map(
      (slot) =>
        new GetClubSlotRdo(
          slot,
          trainings.every((training) => slot.id !== training.slot.id),
        ),
    );
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
        beginning: beginningSlot,
        end: endSlot,
        studio: { id: updateSlotDto.studio },
      },
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return await this.slotsService.remove({ where: { id } });
  }
}
