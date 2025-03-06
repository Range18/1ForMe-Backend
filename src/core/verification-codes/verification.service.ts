import { HttpStatus, Injectable } from '@nestjs/common';
import { BaseEntityService } from '#src/common/base-entity.service';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AllExceptions } from '#src/common/exception-handler/exeption-types/all-exceptions';
import { ApiException } from '#src/common/exception-handler/api-exception';
import { Code } from '#src/core/verification-codes/entity/verification-codes.entity';
import { UserService } from '#src/core/users/user.service';
import { UserEntity } from '#src/core/users/entity/user.entity';
import axios from 'axios';
import { smsServiceConfig } from '#src/common/configs/sms.config';
import EntityExceptions = AllExceptions.EntityExceptions;
import AuthExceptions = AllExceptions.AuthExceptions;

@Injectable()
export class VerificationService extends BaseEntityService<
  Code,
  'EntityExceptions'
> {
  constructor(
    @InjectRepository(Code)
    private readonly codeRepository: Repository<Code>,
    private readonly userService: UserService,
  ) {
    super(
      codeRepository,
      new ApiException<'EntityExceptions'>(
        HttpStatus.NOT_FOUND,
        'EntityExceptions',
        EntityExceptions.NotFound,
      ),
    );
  }

  async createAndSend(code: number, user: UserEntity) {
    await this.save({ code: code, user: user });

    await axios
      .post(
        'https://api.exolve.ru/messaging/v1/SendSMS',
        {
          number: smsServiceConfig.phone,
          destination: user.phone,
          text: `Ваш код - ${code}`,
        },
        { headers: { Authorization: `Bearer ${smsServiceConfig.apiKey}` } },
      )
      .catch((res) => console.log(res.response.data));
  }

  async verify(code: number, userId: number) {
    const verificationCodeEntity = await this.findOne({
      where: { code: code, user: { id: userId } },
    });

    if (!verificationCodeEntity) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'AuthExceptions',
        AuthExceptions.WrongVerificationCode,
      );
    }

    await this.userService.updateOne(
      { where: { id: userId } },
      { isVerified: true },
    );

    await this.removeOne(verificationCodeEntity);
  }
}
