import { ApiProperty } from '@nestjs/swagger';
import { GetStudioRdo } from '#src/core/studios/rdo/get-studio.rdo';
import { City } from '#src/core/city/entity/cities.entity';
import { Clubs } from '#src/core/clubs/entity/clubs.entity';

export class GetClubRdo {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  address: string;

  @ApiProperty({ type: GetStudioRdo })
  studio?: GetStudioRdo;

  @ApiProperty()
  city?: City;

  constructor(club: Clubs) {
    this.id = club.id;
    this.name = club.name;
    this.address = club.address;
    this.studio = club.studio ? new GetStudioRdo(club.studio) : undefined;
    this.city = club.city;
  }
}
