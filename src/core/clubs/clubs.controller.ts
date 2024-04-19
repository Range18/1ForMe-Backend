import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ClubsService } from '#src/core/clubs/clubs.service';
import { UpdateClubDto } from '#src/core/clubs/dto/update-club.dto';
import { CreateClubDto } from '#src/core/clubs/dto/create-club.dto';
import { GetClubRdo } from '#src/core/clubs/rdo/get-club.rdo';

@ApiTags('Clubs')
@Controller('api/studios/clubs')
export class ClubsController {
  constructor(private readonly clubsService: ClubsService) {}

  @ApiCreatedResponse({ type: GetClubRdo })
  @Post()
  async create(@Body() body: CreateClubDto) {
    return new GetClubRdo(
      await this.clubsService.save({
        ...body,
        studio: { id: body.studio },
        city: { id: body.city },
      }),
    );
  }

  @ApiOkResponse({ type: [GetClubRdo] })
  @Get()
  async getAll() {
    const clubs = await this.clubsService.find({
      relations: { city: true, studio: { city: true } },
    });

    return clubs.map((club) => new GetClubRdo(club));
  }

  @ApiOkResponse({ type: GetClubRdo })
  @Get(':id')
  async get(@Param('id') id: number) {
    return new GetClubRdo(await this.clubsService.findOne({ where: { id } }));
  }

  // TODO PERMS
  @ApiOkResponse({ type: GetClubRdo })
  @ApiBody({ type: UpdateClubDto })
  @Patch(':id')
  async update(@Param('id') id: number, @Body() updateClubDto: UpdateClubDto) {
    return new GetClubRdo(
      await this.clubsService.updateOne({ where: { id } }, updateClubDto),
    );
  }
}
