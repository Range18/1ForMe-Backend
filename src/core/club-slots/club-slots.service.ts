import { HttpStatus, Injectable } from '@nestjs/common';
import { BaseEntityService } from '#src/common/base-entity.service';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ApiException } from '#src/common/exception-handler/api-exception';
import { AllExceptions } from '#src/common/exception-handler/exeption-types/all-exceptions';
import { ClubSlots } from '#src/core/club-slots/entities/club-slot.entity';
import { TrainingsService } from '#src/core/trainings/trainings.service';
import { GetClubSlotRdo } from '#src/core/club-slots/rdo/get-club-slot.rdo';
import { StudiosService } from '#src/core/studios/studios.service';
import { GetSlotsForStudio } from '#src/core/club-slots/rdo/get-slots-for-studio';
import { ClubsService } from '#src/core/clubs/clubs.service';
import { getDateRange } from '#src/common/utilities/date-range.func';
import { UserService } from '#src/core/users/user.service';
import { SlotsService } from '#src/core/trainer-slots/slots.service';
import { GetTimeTableForStudioRdo } from '#src/core/club-slots/rdo/get-time-table-for-studio.rdo';
import { GetTimeTableRdo } from '#src/core/club-slots/rdo/get-time-table.rdo';
import { GetSlotForTimeTableRdo } from '#src/core/club-slots/rdo/get-slot-for-time-table.rdo';
import { UserEntity } from '#src/core/users/entity/user.entity';
import { GetClubScheduleRdo } from '#src/core/club-slots/rdo/get-club-schedule.rdo';
import EntityExceptions = AllExceptions.EntityExceptions;

@Injectable()
export class ClubSlotsService extends BaseEntityService<
  ClubSlots,
  'EntityExceptions'
> {
  constructor(
    @InjectRepository(ClubSlots)
    private readonly clubsSlotsRepository: Repository<ClubSlots>,
    private readonly trainingsService: TrainingsService,
    private readonly studiosService: StudiosService,
    private readonly clubsService: ClubsService,
    private readonly userService: UserService,
    private readonly trainingService: TrainingsService,
    private readonly trainerSlotsService: SlotsService,
  ) {
    super(
      clubsSlotsRepository,
      new ApiException<'EntityExceptions'>(
        HttpStatus.NOT_FOUND,
        'EntityExceptions',
        EntityExceptions.NotFound,
      ),
    );
  }

  async getSlotsForClub(clubId: number, date: Date): Promise<GetClubSlotRdo[]> {
    const trainings = await this.trainingsService.find({
      where: { date: date, club: { id: clubId } },
      relations: { slot: true, club: true },
    });

    const slots = await this.find({
      // where: { club: { id: clubId } },
      order: { id: 'ASC' },
      relations: { club: { studio: true } },
    });

    return slots.map(
      (slot) =>
        new GetClubSlotRdo(
          slot,
          trainings.every((training) => slot.id !== training.slot.id),
        ),
    );
  }

  async getSlotsForStudio(
    studioId: number,
    weekStart: Date,
    days: number,
  ): Promise<GetClubSlotRdo[]> {
    const studio = await this.studiosService.findOne({
      where: { id: studioId },
      relations: { clubs: true },
    });

    if (!studio) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'EntityExceptions',
        EntityExceptions.NotFound,
      );
    }

    const studioSlots = [];

    const week = getDateRange(weekStart, days);

    for (const club of studio.clubs) {
      for (const date of week) {
        const slots = await this.getSlotsForClub(
          club.id,
          date.toISOString().split('T')[0] as unknown as Date,
        );

        studioSlots.push(
          new GetSlotsForStudio(
            date.toISOString().split('T')[0] as unknown as Date,
            club,
            slots,
          ),
        );
      }
    }

    return studioSlots;
  }

  async getSlotsForStudioAll(
    weekStart: Date,
    days: number,
  ): Promise<GetClubSlotRdo[]> {
    const clubs = await this.clubsService.find({
      relations: { studio: true, city: true },
    });

    if (clubs.length === 0) {
      return [];
    }

    const studioSlots = [];

    const week = getDateRange(weekStart, days);

    for (const club of clubs) {
      for (const date of week) {
        const slots = await this.getSlotsForClub(
          club.id,
          date.toISOString().split('T')[0] as unknown as Date,
        );

        studioSlots.push(
          new GetSlotsForStudio(
            date.toISOString().split('T')[0] as unknown as Date,
            club,
            slots,
          ),
        );
      }
    }

    return studioSlots;
  }

  async getStudioTimeTable(
    days: number,
    studioId: number,
  ): Promise<GetTimeTableRdo> {
    const studio = await this.studiosService.findOne({
      where: { id: studioId },
      relations: { clubs: { city: true } },
    });

    if (!studio) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'EntityExceptions',
        EntityExceptions.NotFound,
      );
    }

    const trainers = await this.userService.find({
      where: { role: { name: 'trainer' }, isTrainerActive: true },
    });

    if (trainers.length === 0) {
      return new GetTimeTableRdo(studio, []);
    }

    const dateRange = getDateRange(new Date(), days);

    const timeTable: GetTimeTableForStudioRdo[] = [];

    for (const date of dateRange) {
      const clubTimeTable: GetClubScheduleRdo[] = [];
      for (const club of studio.clubs) {
        const slots = await this.getSlotsForClub(
          club.id,
          date.toISOString().split('T')[0] as unknown as Date,
        );

        const slotsForTimeTable: GetSlotForTimeTableRdo[] = [];

        const trainerSlots = await this.trainerSlotsService.find({
          where: {
            date: date.toISOString().split('T')[0] as unknown as Date,
            trainer: { id: In(trainers.map((trainer) => trainer.id)) },
          },
          relations: {
            trainer: true,
            beginning: true,
            end: true,
            studio: true,
          },
        });

        for (const slot of slots) {
          const availableTrainers: UserEntity[] = [];
          for (const trainerSlot of trainerSlots) {
            if (
              trainerSlot.beginning.id <= slot.id &&
              slot.id <= trainerSlot.end.id
            ) {
              availableTrainers.push(trainerSlot.trainer);
            }
            if (availableTrainers.length > 0) {
              slotsForTimeTable.push(
                new GetSlotForTimeTableRdo(
                  slot,
                  slot.isAvailable,
                  availableTrainers,
                ),
              );
            }
          }
        }
        clubTimeTable.push(new GetClubScheduleRdo(club, slotsForTimeTable));
      }

      timeTable.push(
        new GetTimeTableForStudioRdo(
          date.toISOString().split('T')[0],
          clubTimeTable,
        ),
      );
    }

    return new GetTimeTableRdo(studio, timeTable);
  }
}
