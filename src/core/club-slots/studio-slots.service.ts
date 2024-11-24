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
import { TimeToDate } from '#src/common/utilities/timeToDate.func';
import { parseHoursMinutes } from '#src/common/utilities/parse-hours-minutes';
import { Clubs } from '#src/core/clubs/entity/clubs.entity';
import ms from 'ms';
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
    private readonly trainingService: TrainingsService,
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

  private convertToMySQLDate(date: Date): Date {
    return date.toISOString().split('T')[0] as unknown as Date;
  }

  private isHoursAndMinutesLTE(dateA: Date, dateB: Date): boolean {
    return (
      dateA.getHours() * 60 + dateA.getMinutes() <=
      dateB.getHours() * 60 + dateB.getMinutes()
    );
  }

  private getSlotDate(dateString: Date, time: string): Date {
    const slotDate = new Date(dateString);
    const parsedTime = parseHoursMinutes(time);

    slotDate.setHours(parsedTime[0]);
    slotDate.setMinutes(parsedTime[1]);

    return slotDate;
  }
  async getSlotsForClub(club: Clubs, date: Date): Promise<GetClubSlotRdo[]>;
  async getSlotsForClub(clubId: number, date: Date): Promise<GetClubSlotRdo[]>;
  async getSlotsForClub(
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

    const slots = await this.find({
      where: { studio: { id: club.studio.id } },
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

  async getClubsSlotsForDateRange(clubs: Clubs[], dateRange: Date[]) {
    const slots = [];
    for (const club of clubs) {
      for (const date of dateRange) {
        const convertedDate = this.convertToMySQLDate(date);
        const clubSlots = await this.getSlotsForClub(club, convertedDate);
        slots.push(new GetSlotsForStudio(convertedDate, club, clubSlots));
      }
    }
    return slots;
  }

  async getSlotsForStudio(studioId: number): Promise<GetClubSlotRdo[]> {
    const trainings = [];

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
        ),
    );
  }

  async getSlotsForClubsOfStudio(
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
    weekStart.setHours(weekStart.getHours() + 5);
    const week = getDateRange(weekStart, days);
    return await this.getClubsSlotsForDateRange(studio.clubs, week);
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

    weekStart.setHours(weekStart.getHours() + 5);
    const week = getDateRange(weekStart, days);
    return await this.getClubsSlotsForDateRange(clubs, week);
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
    const timeNow = Date.now();

    for (const date of dateRange) {
      const convertedDate = this.convertToMySQLDate(date);
      const clubTimeTable: GetClubScheduleRdo[] = [];
      for (const club of studio.clubs) {
        const slots = await this.getSlotsForClub(club, convertedDate);

        const slotsForTimeTable: GetSlotForTimeTableRdo[] = [];
        const trainerSlots = await this.trainerSlotsService.find({
          where: {
            date: convertedDate,
            trainer: {
              id: In(trainers.map((trainer) => trainer.id)),
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

        for (const slot of slots) {
          const availableTrainers: UserEntity[] = [];
          for (const trainerSlot of trainerSlots) {
            const trainerSlotBeginningDate = this.getSlotDate(
              trainerSlot.date,
              trainerSlot.beginning.beginningTime,
            );
            const trainerSlotEndingDate = this.getSlotDate(
              trainerSlot.date,
              trainerSlot.end.endingTime,
            );

            //TODO change ms('3h') by property from db
            if (trainerSlotBeginningDate.getTime() - timeNow < ms('3h'))
              continue;

            if (
              this.isHoursAndMinutesLTE(
                trainerSlotBeginningDate,
                TimeToDate(slot.beginningTime),
              ) &&
              this.isHoursAndMinutesLTE(
                TimeToDate(slot.endingTime),
                trainerSlotEndingDate,
              )
            ) {
              const training = await this.trainingService.findOne(
                {
                  where: {
                    date: convertedDate,
                    isCanceled: false,
                    slot: { id: slot.id },
                    trainer: { id: trainerSlot.trainer.id },
                  },
                },
                false,
              );
              if (!training) {
                availableTrainers.push(trainerSlot.trainer);
              }
            }
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
