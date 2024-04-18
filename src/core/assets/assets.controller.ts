import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AssetsService } from './assets.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { type Response } from 'express';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { GetFileRdo } from '#src/core/assets/rdo/get-file.rdo';
import { AuthGuard } from '#src/common/decorators/guards/authGuard.decorator';
import { User } from '#src/common/decorators/User.decorator';
import { type UserRequest } from '#src/common/types/user-request.type';

@ApiTags('Assets')
@Controller('api')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @AuthGuard()
  @ApiCreatedResponse({ type: GetFileRdo })
  @UseInterceptors(FileInterceptor('file'))
  @Post('/users/assets')
  async uploadSectionImage(
    @UploadedFile() file: Express.Multer.File,
    @User() user: UserRequest,
  ) {
    return new GetFileRdo(await this.assetsService.upload(file, user.id));
  }

  @Get('assets/:id/file')
  async GetImageStream(
    @Res({ passthrough: true }) res: Response,
    @Param('id') id: number,
  ) {
    const { buffer, mimetype } = await this.assetsService.getFileStream(id);

    res.setHeader('Content-Type', mimetype);

    return buffer;
  }

  @ApiOkResponse({ type: GetFileRdo })
  @Get('assets/:id')
  async findOne(@Param('id') id: number) {
    return new GetFileRdo(await this.assetsService.findOne({ where: { id } }));
  }

  @Delete('assets/:id')
  async remove(@Param('id') id: number) {
    return await this.assetsService.deleteFile(id);
  }
}
