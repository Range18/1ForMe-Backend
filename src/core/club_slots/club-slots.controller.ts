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
import { GetSlotsForStudio } from '#src/core/club_slots/rdo/get-slots-for-studio';

@ApiTags('Club Slots')
@Controller('api')
export class ClubSlotsController {
  constructor(private readonly clubSlotsService: ClubSlotsService) {}

  @ApiCreatedResponse({ type: GetClubSlotRdo })
  @ApiBody({ type: CreateClubSlotDto })
  @AuthGuard()
  @Post('clubs/:clubId/slots')
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
  @Get('clubs/:clubId/slots')
  async findAllForClub(
    @Param('clubId') clubId: number,
    @Query('date') date: Date,
  ) {
    return await this.clubSlotsService.getSlotsForClub(clubId, date);
  }

  @ApiOkResponse({ type: [GetSlotsForStudio] })
  @AuthGuard()
  @Get('studios/:studioId/slots')
  async findAllForStudio(@Param('studioId') studioId: number) {
    return await this.clubSlotsService.getSlotsForStudio(
      studioId,
      new Date(),
      7,
    );
  }

  @ApiOkResponse({ type: GetClubSlotRdo })
  @Get('clubs/:clubId/slots/:id')
  async findOne(@Param('id') id: number) {
    return await this.clubSlotsService.findOne({
      where: { id },
      relations: { club: { city: true, studio: true } },
    });
  }

  @ApiOkResponse({ type: GetClubSlotRdo })
  @ApiBody({ type: UpdateClubSlotDto })
  @AuthGuard()
  @Patch('clubs/:clubId/slots/:id')
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

  @Delete('clubs/:clubId/slots/:id')
  async remove(@Param('id') id: number) {
    return await this.clubSlotsService.remove({ where: { id } });
  }
}
