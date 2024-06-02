import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { StudioSlotsService } from './studio-slots.service';
import { CreateStudioSlotDto } from './dto/create-studio-slot.dto';
import { AuthGuard } from '#src/common/decorators/guards/authGuard.decorator';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { GetClubSlotRdo } from '#src/core/club-slots/rdo/get-club-slot.rdo';
import { GetSlotsForStudio } from '#src/core/club-slots/rdo/get-slots-for-studio';
import { GetTimeTableRdo } from '#src/core/club-slots/rdo/get-time-table.rdo';

@ApiTags('Studio Slots')
@Controller('api')
export class StudioSlotsController {
  constructor(private readonly studioSlotsService: StudioSlotsService) {}

  @ApiCreatedResponse({ type: GetClubSlotRdo })
  @ApiBody({ type: CreateStudioSlotDto })
  @AuthGuard()
  @Post('studio/:studioId/slots')
  async create(
    @Param('studioId') studioId: number,
    @Body() createClubSlotDto: CreateStudioSlotDto,
  ) {
    return await this.studioSlotsService.save({
      ...createClubSlotDto,
      studio: { id: studioId },
    });
  }

  @ApiOkResponse({ type: [GetClubSlotRdo] })
  @ApiQuery({ name: 'date' })
  @Get('clubs/:clubId/slots')
  async findAllForClub(
    @Param('clubId') clubId: number,
    @Query('date') date: Date,
  ) {
    return await this.studioSlotsService.getSlotsForClub(clubId, date);
  }

  @ApiOkResponse({ type: [GetClubSlotRdo] })
  @Get('studios/:studioId/slots')
  async findAllForStudio(@Param('studioId') studioId: number) {
    return await this.studioSlotsService.getSlotsForStudio(studioId);
  }

  @ApiOkResponse({ type: [GetSlotsForStudio] })
  @Get('studios/:studioId/clubs/slots')
  async findAllForClubsOfStudios(@Param('studioId') studioId: number) {
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
  async getTimeTable(@Param('studioId') studioId: number) {
    return await this.studioSlotsService.getStudioTimeTable(14, studioId);
  }

  // @ApiOkResponse({ type: GetClubSlotRdo })
  // @Get('clubs/:clubId/slots/:id')
  // async findOne(@Param('id') id: number) {
  //   return await this.studioSlotsService.findOne({
  //     where: { id },
  //     relations: { studio: { city: true } },
  //   });
  // }

  // @ApiOkResponse({ type: GetClubSlotRdo })
  // @ApiBody({ type: UpdateClubSlotDto })
  // @AuthGuard()
  // @Patch('clubs/:clubId/slots/:id')
  // async update(
  //   @Param('id') id: number,
  //   @Body() updateSlotDto: UpdateClubSlotDto,
  // ) {
  //   return await this.studioSlotsService.updateOne(
  //     {
  //       where: { id },
  //       relations: { studio: { city: true, studio: true } },
  //     },
  //     {
  //       ...updateSlotDto,
  //       studio: { id: updateSlotDto.club },
  //     },
  //   );
  // }

  @Delete('clubs/:clubId/slots/:id')
  async remove(@Param('id') id: number) {
    return await this.studioSlotsService.remove({ where: { id } });
  }
}
