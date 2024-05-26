import { Body, Controller, Ip, Post } from '@nestjs/common';
import { TinkoffPaymentsService } from '#src/core/tinkoff-payments/tinkoff-payments.service';
import { PaymentNotificationDto } from '#src/core/tinkoff-payments/dto/payment-notification.dto';

@Controller('payments/tinkoff-payments')
export class TinkoffPaymentsController {
  constructor(
    private readonly tinkoffPaymentsService: TinkoffPaymentsService,
  ) {}

  @Post('notification')
  async handleNotification(
    @Ip() ip: string,
    @Body() paymentNotificationDto: PaymentNotificationDto,
  ): Promise<'OK'> {
    return this.tinkoffPaymentsService.handleNotification(
      ip,
      paymentNotificationDto,
    );
  }
}
