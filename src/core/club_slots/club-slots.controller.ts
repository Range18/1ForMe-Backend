import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ClubSlotsService } from './club-slots.service';
import { CreateClubSlotDto } from './dto/create-club-slot.dto';
import { UpdateClubSlotDto } from './dto/update-club-slot.dto';
import { AuthGuard } from '#src/common/decorators/guards/authGuard.decorator';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { type UserRequest } from '#src/common/types/user-request.type';
import { User } from '#src/common/decorators/User.decorator';
import { GetClubSlotRdo } from '#src/core/club_slots/rdo/get-club-slot.rdo';
import { TrainingsService } from '#src/core/trainings/trainings.service';
import * as console from 'node:console';

@ApiTags('Club Slots')
@Controller('api/clubs/:clubId/slots')
export class ClubSlotsController {
  constructor(
    private readonly clubSlotsService: ClubSlotsService,
    private readonly trainingsService: TrainingsService,
  ) {}

  @ApiCreatedResponse({ type: GetClubSlotRdo })
  @ApiBody({ type: CreateClubSlotDto })
  @AuthGuard()
  @Post()
  async create(
    @Param('clubId') clubId: number,
    @Body() createClubSlotDto: CreateClubSlotDto,
    @User() user: UserRequest,
  ) {
    return await this.clubSlotsService.save({
      ...createClubSlotDto,
      club: { id: clubId },
    });
  }

  @ApiOkResponse({ type: [GetClubSlotRdo] })
  @ApiQuery({ name: 'date' })
  @AuthGuard()
  @Get()
  async findAll(@Param('clubId') clubId: number, @Query('date') date: Date) {
    const trainings = await this.trainingsService.find({
      where: { date: date, club: { id: clubId } },
      relations: { slot: true },
    });

    console.log(trainings);

    const slots = await this.clubSlotsService.find({
      relations: { club: { city: true, studio: true } },
      order: { id: 'ASC' },
    });

    return slots.map(
      (slot) =>
        new GetClubSlotRdo(
          slot,
          trainings.length != 0
            ? trainings.every((training) => slot.id !== training.slot.id)
            : true,
        ),
    );
  }

  @ApiOkResponse({ type: GetClubSlotRdo })
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.clubSlotsService.findOne({
      where: { id },
      relations: { club: { city: true, studio: true } },
    });
  }

  @ApiOkResponse({ type: GetClubSlotRdo })
  @ApiBody({ type: UpdateClubSlotDto })
  @AuthGuard()
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateSlotDto: UpdateClubSlotDto,
  ) {
    return await this.clubSlotsService.updateOne(
      {
        where: { id },
        relations: { club: { city: true, studio: true } },
      },
      {
        ...updateSlotDto,
        club: { id: updateSlotDto.club },
      },
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return await this.clubSlotsService.remove({ where: { id } });
  }
}
