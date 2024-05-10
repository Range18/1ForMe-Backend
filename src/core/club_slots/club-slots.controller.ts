import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ClubSlotsService } from './club-slots.service';
import { CreateClubSlotDto } from './dto/create-club-slot.dto';
import { UpdateClubSlotDto } from './dto/update-club-slot.dto';
import { AuthGuard } from '#src/common/decorators/guards/authGuard.decorator';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiHeader,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { type UserRequest } from '#src/common/types/user-request.type';
import { User } from '#src/common/decorators/User.decorator';
import { GetClubSlotRdo } from '#src/core/club_slots/rdo/get-club-slot.rdo';

@ApiTags('Club Slots')
@Controller('api/clubs/:clubId/slots')
export class ClubSlotsController {
  constructor(private readonly clubSlotsService: ClubSlotsService) {}

  @ApiCreatedResponse({ type: GetClubSlotRdo })
  @ApiBody({ type: CreateClubSlotDto })
  @ApiHeader({ name: 'Authorization' })
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
  @ApiHeader({ name: 'Authorization' })
  @AuthGuard()
  @Get()
  async findAll(@Param('clubId') clubId: number, @User() user: UserRequest) {
    return await this.clubSlotsService.find({
      where: { club: { id: clubId } },
      relations: { club: { city: true, studio: true } },
    });
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
  @ApiHeader({ name: 'Authorization' })
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
