import { HttpStatus, Injectable } from '@nestjs/common';
import { BaseEntityService } from '#src/common/base-entity.service';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ApiException } from '#src/common/exception-handler/api-exception';
import { AllExceptions } from '#src/common/exception-handler/exeption-types/all-exceptions';
import { ClubSlots } from '#src/core/studio-slots/entities/club-slot.entity';
import { TrainingsService } from '#src/core/trainings/trainings.service';
import { GetClubSlotRdo } from '#src/core/studio-slots/rdo/get-club-slot.rdo';
import { StudiosService } from '#src/core/studios/studios.service';
import { GetSlotsForStudio } from '#src/core/studio-slots/rdo/get-slots-for-studio';
import { ClubsService } from '#src/core/clubs/clubs.service';
import { getDateRange } from '#src/common/utilities/date-range.func';
import { UserService } from '#src/core/users/user.service';
import { SlotsService } from '#src/core/trainer-slots/slots.service';
import { GetTimeTableForStudioRdo } from '#src/core/studio-slots/rdo/get-time-table-for-studio.rdo';
import { GetTimeTableRdo } from '#src/core/studio-slots/rdo/get-time-table.rdo';
import { GetSlotForTimeTableRdo } from '#src/core/studio-slots/rdo/get-slot-for-time-table.rdo';
import { UserEntity } from '#src/core/users/entity/user.entity';
import { GetClubScheduleRdo } from '#src/core/studio-slots/rdo/get-club-schedule.rdo';
import { Clubs } from '#src/core/clubs/entity/clubs.entity';
import ms from 'ms';
import { setZeroHours } from '#src/common/utilities/set-zero-hours.func';
import { isTimeLTE } from '#src/common/utilities/is-time-lte.func';
import { Slot } from '#src/core/trainer-slots/entities/slot.entity';
import { parseHoursMinutes } from '#src/common/utilities/parse-hours-minutes.func';
import { addTimeToDate } from '#src/common/utilities/add-time-to-date.func';
import EntityExceptions = AllExceptions.EntityExceptions;
import ClubSlotsExceptions = AllExceptions.ClubSlotsExceptions;

@Injectable()
export class StudioSlotsService extends BaseEntityService<
  ClubSlots,
  'ClubSlotsExceptions'
> {
  constructor(
    @InjectRepository(ClubSlots)
    private readonly clubsSlotsRepository: Repository<ClubSlots>,
    private readonly trainingsService: TrainingsService,
    private readonly studiosService: StudiosService,
    private readonly clubsService: ClubsService,
    private readonly userService: UserService,
    private readonly trainerSlotsService: SlotsService,
  ) {
    super(
      clubsSlotsRepository,
      new ApiException<'ClubSlotsExceptions'>(
        HttpStatus.NOT_FOUND,
        'ClubSlotsExceptions',
        ClubSlotsExceptions.NotFound,
      ),
    );
  }

  private getSlotDate(dateString: Date, time: string): Date {
    const slotDate = new Date(dateString);
    const parsedTime = parseHoursMinutes(time);

    slotDate.setHours(parsedTime[0]);
    slotDate.setMinutes(parsedTime[1]);

    return slotDate;
  }

  async getStudioSlots(
    studioId: number,
    trainings = [],
    club?: Clubs,
  ): Promise<GetClubSlotRdo[]> {
    const slots = await this.find({
      where: { studio: { id: studioId } },
      order: { beginningTime: 'ASC' },
      relations: { studio: true },
    });

    return slots.map(
      (slot) =>
        new GetClubSlotRdo(
          slot,
          trainings.every((training) => slot.id !== training.slot.id),
          club,
        ),
    );
  }

  async getClubSlots(club: Clubs, date: Date): Promise<GetClubSlotRdo[]>;
  async getClubSlots(clubId: number, date: Date): Promise<GetClubSlotRdo[]>;
  async getClubSlots(
    clubIdOrEntity: number | Clubs,
    date: Date,
  ): Promise<GetClubSlotRdo[]> {
    const club =
      typeof clubIdOrEntity == 'number' || typeof clubIdOrEntity == 'string'
        ? await this.clubsService.findOne({
            where: { id: clubIdOrEntity },
            relations: { studio: true },
          })
        : clubIdOrEntity;

    if (!club) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'EntityExceptions',
        EntityExceptions.NotFound,
      );
    }

    const trainings = await this.trainingsService.find({
      where: { date: date, club: { id: club.id }, isCanceled: false },
      relations: { slot: true, club: true },
    });

    return await this.getStudioSlots(club.studio.id, trainings, club);
  }

  async getClubSlotsForDateRange(clubs: Clubs[], dateRange: Date[]) {
    const slots = [];
    for (const club of clubs) {
      for (const date of dateRange) {
        const convertedDate = setZeroHours(date);
        const clubSlots = await this.getClubSlots(club, convertedDate);
        slots.push(new GetSlotsForStudio(convertedDate, club, clubSlots));
      }
    }
    return slots;
  }

  async getSlotsForClubsOfStudio(
    studioId: number,
    weekStart: Date,
    days: number,
  ): Promise<GetClubSlotRdo[]> {
    const studio = await this.studiosService.findOne({
      where: { id: studioId },
      relations: { clubs: { studio: true } },
    });

    if (!studio) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'EntityExceptions',
        EntityExceptions.NotFound,
      );
    }

    weekStart.setHours(weekStart.getHours() + 5);
    const week = getDateRange(weekStart, days);
    return await this.getClubSlotsForDateRange(studio.clubs, week);
  }

  async getAllClubSlots(
    weekStart: Date,
    days: number,
  ): Promise<GetClubSlotRdo[]> {
    const clubs = await this.clubsService.find({
      relations: { studio: true, city: true },
    });

    if (clubs.length === 0) {
      return [];
    }

    weekStart.setHours(weekStart.getHours() + 5);
    const week = getDateRange(weekStart, days);
    return await this.getClubSlotsForDateRange(clubs, week);
  }

  async getStudioTimeTable(
    days: number,
    studioId: number,
  ): Promise<GetTimeTableRdo> {
    const studio = await this.studiosService.findOne({
      where: { id: studioId },
      relations: { clubs: { city: true, studio: true } },
    });

    if (!studio) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'EntityExceptions',
        EntityExceptions.NotFound,
      );
    }

    const trainerIds = (
      await this.userService.find({
        where: { role: { name: 'trainer' }, isTrainerActive: true },
        select: { id: true },
      })
    ).map((trainer) => trainer.id);

    if (trainerIds.length === 0) {
      return new GetTimeTableRdo(studio, []);
    }

    const weekStart = new Date();
    weekStart.setHours(weekStart.getHours() + 5);
    const dateRange = getDateRange(weekStart, days);
    const timeTable: GetTimeTableForStudioRdo[] = [];

    for (const date of dateRange) {
      const convertedDate = setZeroHours(date);
      const clubTimeTable: GetClubScheduleRdo[] = [];

      for (const club of studio.clubs) {
        const slots = await this.getClubSlots(club, convertedDate);
        clubTimeTable.push(
          new GetClubScheduleRdo(
            club,
            await this.getClubSlotsForTimeTable(
              studioId,
              trainerIds,
              slots,
              convertedDate,
              weekStart.getTime(),
            ),
          ),
        );
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

  private async checkIsTrainerAvailable(
    trainerSlot: Slot,
    trainingSlot: GetClubSlotRdo,
    date: Date,
  ): Promise<boolean> {
    const trainerSlotBeginningDate = this.getSlotDate(
      trainerSlot.date,
      trainerSlot.beginning.beginningTime,
    );
    const trainerSlotEndingDate = this.getSlotDate(
      trainerSlot.date,
      trainerSlot.end.endingTime,
    );

    if (
      isTimeLTE(
        trainerSlotBeginningDate,
        addTimeToDate(trainingSlot.beginningTime),
      ) &&
      isTimeLTE(addTimeToDate(trainingSlot.endingTime), trainerSlotEndingDate)
    ) {
      const training = await this.trainingsService.findOne(
        {
          where: {
            date: date,
            isCanceled: false,
            slot: { id: trainingSlot.id },
            trainer: { id: trainerSlot.trainer.id },
          },
        },
        false,
      );
      return !training;
    }
    return false;
  }

  private async getAvailableTrainers(
    trainerSlots: Slot[],
    trainingSlot: GetClubSlotRdo,
    date: Date,
  ) {
    const availableTrainers: UserEntity[] = [];
    for (const trainerSlot of trainerSlots) {
      const isTrainerAvailable = await this.checkIsTrainerAvailable(
        trainerSlot,
        trainingSlot,
        date,
      );
      if (isTrainerAvailable) availableTrainers.push(trainerSlot.trainer);
    }
    return availableTrainers;
  }

  private async getClubSlotsForTimeTable(
    studioId: number,
    trainerIds: number[],
    trainingSlots: GetClubSlotRdo[],
    date: Date,
    timeNow: number,
  ) {
    const slotsForTimeTable: GetSlotForTimeTableRdo[] = [];
    const trainerSlots = await this.trainerSlotsService.find({
      where: {
        date: date,
        studio: { id: studioId },
        trainer: {
          id: In(trainerIds),
          isTrainerActive: true,
        },
      },
      relations: {
        trainer: true,
        beginning: true,
        end: true,
        studio: true,
      },
    });

    for (const trainingSlot of trainingSlots) {
      const slotBeginningDate = this.getSlotDate(
        date,
        trainingSlot.beginningTime,
      );

      //TODO change ms('3h') by property from db
      if (slotBeginningDate.getTime() - timeNow < ms('3h')) continue;

      const availableTrainers = await this.getAvailableTrainers(
        trainerSlots,
        trainingSlot,
        date,
      );
      if (availableTrainers.length > 0) {
        slotsForTimeTable.push(
          new GetSlotForTimeTableRdo(
            trainingSlot,
            trainingSlot.isAvailable,
            availableTrainers,
          ),
        );
      }
    }
    return slotsForTimeTable;
  }
}
