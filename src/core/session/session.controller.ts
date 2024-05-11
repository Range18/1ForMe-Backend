import { Controller, Post } from '@nestjs/common';
import { LoggedUserRdo } from '#src/core/users/rdo/logged-user.rdo';
import { SessionService } from '#src/core/session/session.service';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { Session } from '#src/common/decorators/session.decorator';
import { type RequestSession } from '#src/common/types/request-session.type';
import { AuthGuard } from '#src/common/decorators/guards/authGuard.decorator';

@ApiTags('session')
@Controller('api/session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @AuthGuard()
  @ApiCreatedResponse({ type: LoggedUserRdo })
  @Post('refresh')
  async refresh(@Session() session: RequestSession): Promise<LoggedUserRdo> {
    return await this.sessionService.refreshSession(
      await this.sessionService.findOne({
        where: { sessionId: session.sessionId },
      }),
    );
  }
}
