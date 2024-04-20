import { ApiProperty } from '@nestjs/swagger';
import { Studio } from '#src/core/studios/entities/studio.entity';
import { GetUserRdo } from '#src/core/users/rdo/get-user.rdo';
import { City } from '#src/core/city/entity/cities.entity';
import { Sport } from '#src/core/sports/entity/sports.entity';
import { GetClubRdo } from '#src/core/clubs/rdo/get-club.rdo';

export class GetStudioRdo {
  @ApiProperty()
  readonly id: number;

  @ApiProperty()
  readonly name: string;

  @ApiProperty()
  readonly tax: number;

  @ApiProperty({ nullable: true })
  readonly address?: string;

  @ApiProperty({ nullable: true, type: [GetUserRdo] })
  readonly trainers?: GetUserRdo[];

  @ApiProperty({ nullable: true, type: [GetClubRdo] })
  readonly clubs?: GetClubRdo[];

  @ApiProperty({ nullable: true })
  readonly city?: City;

  @ApiProperty({ nullable: true })
  readonly sports?: Sport[];

  constructor(studio: Studio) {
    this.id = studio.id;
    this.name = studio.name;
    this.tax = studio.tax;
    this.address = studio.address;
    this.clubs = studio.clubs
      ? studio.clubs.map((club) => new GetClubRdo(club))
      : undefined;
    this.city = studio?.city;
    this.sports = studio?.sports;
    this.trainers = studio.trainers
      ? studio.trainers.map((user) => new GetUserRdo(user))
      : undefined;
  }
}
