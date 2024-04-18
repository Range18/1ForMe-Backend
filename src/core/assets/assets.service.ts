import { HttpStatus, Injectable, StreamableFile } from '@nestjs/common';
import { BaseEntityService } from '#src/common/base-entity.service';
import { AssetEntity } from '#src/core/assets/entities/asset.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiException } from '#src/common/exception-handler/api-exception';

import { unlink } from 'fs/promises';
import { storageConfig } from '#src/common/configs/storage.config';
import { createReadStream } from 'fs';
import { UserService } from '#src/core/users/user.service';
import { AllExceptions } from '#src/common/exception-handler/exeption-types/all-exceptions';
import StorageExceptions = AllExceptions.StorageExceptions;
import UserExceptions = AllExceptions.UserExceptions;

@Injectable()
export class AssetsService extends BaseEntityService<
  AssetEntity,
  'StorageExceptions'
> {
  constructor(
    @InjectRepository(AssetEntity)
    private readonly assetsRepository: Repository<AssetEntity>,
    private readonly userService: UserService,
  ) {
    super(
      assetsRepository,
      new ApiException<'StorageExceptions'>(
        HttpStatus.NOT_FOUND,
        'StorageExceptions',
        StorageExceptions.NotFound,
      ),
    );
  }

  async upload(file: Express.Multer.File, id: number) {
    const entity = await this.userService.findOne({
      where: { id },
      relations: { avatar: true },
    });

    if (!entity) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'UserExceptions',
        UserExceptions.UserNotFound,
      );
    }

    if (entity.avatar) {
      await unlink(entity.avatar.path);

      await this.removeOne(entity.avatar);
    }

    return await this.save({
      name: file.filename,
      user: { id: id },
      path: file.path,
      mimetype: file.mimetype,
    });
  }

  async getFileStream(id: number) {
    const image = await this.findOne({ where: { id } });

    if (!image) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'StorageExceptions',
        StorageExceptions.NotFound,
      );
    }

    try {
      const stream = createReadStream(image.path);

      return { buffer: new StreamableFile(stream), mimetype: image.mimetype };
    } catch (error) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'StorageExceptions',
        StorageExceptions.NotFound,
      );
    }
  }

  async deleteFile(id: number) {
    const image = await this.findOne({ where: { id } });

    if (!image) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'StorageExceptions',
        StorageExceptions.NotFound,
      );
    }

    try {
      await unlink(storageConfig.path);

      await this.removeOne(image);
    } catch (error) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'StorageExceptions',
        StorageExceptions.NotFound,
      );
    }
  }
}
