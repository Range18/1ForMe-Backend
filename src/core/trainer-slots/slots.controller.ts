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
import { GetSlotRdo } from '#src/core/trainer-slots/rdo/get-slot.rdo';
import { type UserRequest } from '#src/common/types/user-request.type';
import { User } from '#src/common/decorators/User.decorator';
import { ApiException } from '#src/common/exception-handler/api-exception';
import { AllExceptions } from '#src/common/exception-handler/exeption-types/all-exceptions';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { TrainingsService } from '#src/core/trainings/trainings.service';
import { GetClubSlotRdo } from '#src/core/studio-slots/rdo/get-club-slot.rdo';
import { InjectRepository } from '@nestjs/typeorm';
import { ClubSlots } from '#src/core/studio-slots/entities/club-slot.entity';
import EntityExceptions = AllExceptions.EntityExceptions;

@ApiTags('Slots')
@Controller('api/slots')
export class SlotsController {
  constructor(
    private readonly slotsService: SlotsService,
    @InjectRepository(ClubSlots)
    private readonly clubsRepository: Repository<ClubSlots>,
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
    const beginningSlot = await this.clubsRepository.findOne({
      where: { id: createSlotDto.beginning },
    });

    const endSlot = await this.clubsRepository.findOne({
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

    const slots = await this.clubsRepository.find({
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
  @Get('trainers/:trainerId/available')
  async getAllTrainerTime(
    @User() user: UserRequest,
    @Param('trainerId') trainerId: number,
    @Query('date') date: Date,
  ) {
    const trainerTime = await this.slotsService.find({
      where: {
        trainer: { id: trainerId },
        date: MoreThanOrEqual(
          new Date().toISOString().split('T')[0] as unknown as Date,
        ),
      },
      order: { day: 'ASC' },
      relations: { studio: { city: true }, end: true, beginning: true },
    });

    const slots = await this.clubsRepository.find({
      relations: { club: { city: true, studio: true } },
      order: { id: 'ASC' },
    });

    const freeSlots = [];

    for (const trainerSlot of trainerTime) {
      const trainings = await this.trainingService.find({
        where: { trainer: { id: trainerId }, date: trainerSlot.date },
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
    const beginningSlot = await this.clubsRepository.findOne({
      where: { id: updateSlotDto.beginning },
    });

    const endSlot = await this.clubsRepository.findOne({
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
