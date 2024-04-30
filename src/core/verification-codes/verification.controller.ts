import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiHeader, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { VerificationService } from '#src/core/verification-codes/verification.service';
import { VerifyByCodeDto } from '#src/core/verification-codes/dto/verify-by-code.dto';
import { AuthGuard } from '#src/common/decorators/guards/authGuard.decorator';
import { type UserRequest } from '#src/common/types/user-request.type';
import { User } from '#src/common/decorators/User.decorator';

@ApiTags('Verification')
@Controller('api/auth/verify')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @ApiBody({ type: VerifyByCodeDto })
  @ApiHeader({ name: 'Authorization' })
  @AuthGuard()
  @ApiOkResponse()
  @Post()
  async verify(@Body() body: VerifyByCodeDto, @User() user: UserRequest) {
    return await this.verificationService.verify(body.code, user.id);
  }
}
