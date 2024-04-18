import { AssetEntity } from '#src/core/assets/entities/asset.entity';
import { backendServer } from '#src/common/configs/config';
import { ApiProperty } from '@nestjs/swagger';

export class GetFileRdo {
  @ApiProperty()
  readonly id: number;

  @ApiProperty()
  readonly name: string;

  @ApiProperty()
  readonly mimetype: string;

  @ApiProperty()
  readonly url: string;

  @ApiProperty()
  readonly updatedAt: Date;

  @ApiProperty()
  readonly createAt: Date;

  constructor(file: AssetEntity) {
    this.id = file.id;
    this.name = file.name;
    this.mimetype = file.mimetype;
    this.url = `${backendServer.urlValue}/api/assets/${file.id}/file`;
    this.createAt = file.createdAt;
    this.updatedAt = file.updatedAt;
  }
}
