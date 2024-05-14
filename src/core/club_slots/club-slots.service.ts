import { HttpStatus, Injectable } from '@nestjs/common';
import { BaseEntityService } from '#src/common/base-entity.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiException } from '#src/common/exception-handler/api-exception';
import { AllExceptions } from '#src/common/exception-handler/exeption-types/all-exceptions';
import { ClubSlots } from '#src/core/club_slots/entities/club-slot.entity';
import { TrainingsService } from '#src/core/trainings/trainings.service';
import { GetClubSlotRdo } from '#src/core/club_slots/rdo/get-club-slot.rdo';
import console from 'node:console';
import { StudiosService } from '#src/core/studios/studios.service';
import { GetSlotsForStudio } from '#src/core/club_slots/rdo/get-slots-for-studio';
import { ClubsService } from '#src/core/clubs/clubs.service';
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

    console.log(trainings);

    const slots = await this.find({
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

  private dateRange(start: Date, days: number): Date[] {
    const dates: Date[] = [];

    for (let i = 0; i <= days; i++) {
      const newDate = new Date(start);
      newDate.setDate(start.getDate() + i);
      dates.push(newDate);
    }

    return dates;
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

    const week = this.dateRange(weekStart, days);

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

    const week = this.dateRange(weekStart, days);

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
}
