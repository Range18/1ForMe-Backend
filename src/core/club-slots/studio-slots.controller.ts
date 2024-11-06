import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { StudioSlotsService } from './studio-slots.service';
import { AuthGuard } from '#src/common/decorators/guards/authGuard.decorator';
import { ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { GetClubSlotRdo } from '#src/core/club-slots/rdo/get-club-slot.rdo';
import { GetSlotsForStudio } from '#src/core/club-slots/rdo/get-slots-for-studio';
import { GetTimeTableRdo } from '#src/core/club-slots/rdo/get-time-table.rdo';

@ApiTags('Studio Slots')
@Controller('api')
export class StudioSlotsController {
  constructor(private readonly studioSlotsService: StudioSlotsService) {}

  @ApiOkResponse({ type: [GetClubSlotRdo] })
  @ApiQuery({ name: 'date' })
  @Get('clubs/:clubId/slots')
  async findAllForClub(
    @Param('clubId', new ParseIntPipe()) clubId: number,
    @Query('date') date: Date,
  ) {
    return await this.studioSlotsService.getSlotsForClub(clubId, date);
  }

  @ApiOkResponse({ type: [GetClubSlotRdo] })
  @Get('studios/:studioId/slots')
  async findAllForStudio(
    @Param('studioId', new ParseIntPipe()) studioId: number,
  ) {
    return await this.studioSlotsService.getSlotsForStudio(studioId);
  }

  @ApiOkResponse({ type: [GetSlotsForStudio] })
  @Get('studios/:studioId/clubs/slots')
  async findAllForClubsOfStudios(
    @Param('studioId', new ParseIntPipe()) studioId: number,
  ) {
    return await this.studioSlotsService.getSlotsForClubsOfStudio(
      studioId,
      new Date(),
      6,
    );
  }

  @ApiOkResponse({ type: [GetSlotsForStudio] })
  @AuthGuard()
  @Get('studios/slots/all')
  async findAllForStudios() {
    return await this.studioSlotsService.getSlotsForStudioAll(new Date(), 6);
  }

  @ApiOkResponse({ type: GetTimeTableRdo })
  @Get('studios/:studioId/timetable')
  async getTimeTable(@Param('studioId', new ParseIntPipe()) studioId: number) {
    return await this.studioSlotsService.getStudioTimeTable(14, studioId);
  }
}
