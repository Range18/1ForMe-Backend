import { ApiProperty } from '@nestjs/swagger';
import { Studio } from '#src/core/studios/entities/studio.entity';

export class GetStudioRdo {
  @ApiProperty()
  readonly id: number;

  @ApiProperty()
  readonly name: string;

  constructor(studio: Studio) {
    this.id = studio.id;
    this.name = studio.name;
  }
}
