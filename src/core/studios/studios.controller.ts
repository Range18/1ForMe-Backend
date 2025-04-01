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
import { StudiosService } from './studios.service';
import { CreateStudioDto } from './dto/create-studio.dto';
import { UpdateStudioDto } from './dto/update-studio.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { GetStudioRdo } from '#src/core/studios/rdo/get-studio.rdo';
import { GetClubRdo } from '#src/core/clubs/rdo/get-club.rdo';
import { User } from '#src/common/decorators/User.decorator';
import { type UserRequest } from '#src/common/types/user-request.type';
import { UserService } from '#src/core/users/user.service';
import { AuthGuard } from '#src/common/decorators/guards/authGuard.decorator';
import { In } from 'typeorm';
import { StudiosQueryDto } from '#src/core/studios/dto/studios-query.dto';

@ApiTags('Studios')
@Controller('api/studios')
export class StudiosController {
  constructor(
    private readonly studiosService: StudiosService,
    private readonly userService: UserService,
  ) {}

  @ApiCreatedResponse({ type: GetStudioRdo })
  @Post()
  async create(@Body() createStudioDto: CreateStudioDto) {
    return new GetStudioRdo(
      await this.studiosService.save({
        ...createStudioDto,
        city: { id: createStudioDto.city },
      }),
    );
  }

  @ApiOkResponse({ type: [GetStudioRdo] })
  @Get()
  async findAll(@Query() query: StudiosQueryDto) {
    const studios = await this.studiosService.find({
      where: { city: query.city ? { name: query.city } : undefined },
      relations: {
        trainers: { category: true, avatar: true, role: true },
        clubs: { city: true },
        city: true,
        tariffs: { category: true, sport: true },
      },
    });

    return studios.map((studio) => new GetStudioRdo(studio));
  }

  @ApiOkResponse({ type: GetStudioRdo })
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return new GetStudioRdo(
      await this.studiosService.findOne({
        where: { id },
        relations: {
          trainers: { category: true, avatar: true, role: true },
          clubs: { city: true },
          city: true,
          tariffs: { category: true, sport: true },
        },
      }),
    );
  }

  @ApiOkResponse({ type: [GetClubRdo] })
  @Get(':id/clubs')
  async findStudiosClubs(@Param('id') id: number) {
    const studio = await this.studiosService.findOne({
      where: { id },
      relations: {
        clubs: { city: true, studio: { city: true } },
      },
    });

    return studio?.clubs.map((club) => new GetClubRdo(club));
  }

  @AuthGuard()
  @ApiOkResponse({ type: [GetClubRdo] })
  @Get('/clubs')
  async findUsersClubs(@Param('id') id: number, @User() user: UserRequest) {
    const userEntity = await this.userService.findOne({
      where: { id: user.id },
      relations: { studios: true },
    });

    const studioIds =
      userEntity.studios.length !== 0
        ? userEntity.studios.map((studio) => studio.id)
        : undefined;

    const studios = await this.studiosService.find({
      where: { id: studioIds ? In(studioIds) : undefined },
      relations: {
        clubs: { city: true, studio: { city: true } },
      },
    });

    return studios
      ? studios?.map((studio) =>
          studio.clubs.map((club) => new GetClubRdo(club)),
        )
      : [];
  }

  @ApiOkResponse({ type: GetStudioRdo })
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateStudioDto: UpdateStudioDto,
  ) {
    return new GetStudioRdo(
      await this.studiosService.updateOne(
        {
          where: { id },
          relations: {
            trainers: {
              category: true,
              avatar: true,
              role: true,
            },
            clubs: { city: true },
            city: true,
          },
        },
        updateStudioDto,
      ),
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return await this.studiosService.removeOne({ where: { id } });
  }
}
