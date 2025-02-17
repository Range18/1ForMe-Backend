// import { Injectable } from '@nestjs/common';
// import { TrainingsService } from '#src/core/trainings/trainings.service';
// import { WazzupMessagingService } from '#src/core/wazzup-messaging/wazzup-messaging.service';
// import { UserService } from '#src/core/users/user.service';
// import { Cron, CronExpression } from '@nestjs/schedule';
// import ms from 'ms';
// import { MoreThanOrEqual } from 'typeorm';
// import { setZeroHours } from '#src/common/utilities/set-zero-hours.func';
// import { messageTemplates } from '#src/core/wazzup-messaging/templates/message-templates';
// import { frontendServer } from '#src/common/configs/config';
//
// @Injectable()
// export class NotifyDisloyalClientsService {
//   constructor(
//     private readonly trainingsService: TrainingsService,
//     private readonly wazzupMessagingService: WazzupMessagingService,
//     private readonly usersService: UserService,
//   ) {
//   }
//
//   @Cron(CronExpression.EVERY_DAY_AT_4AM)
//   async notifyDisloyalClients() {
//     const today = setZeroHours(new Date());
//
//     const users = await this.usersService.find({
//       where: { role: { name: 'client' } },
//       relations: { trainingsAsClient: true, chatType: true },
//     });
//
//     for (const user of users) {
//       if (user.trainingsAsClient.length === 0) {
//       }
//
//       const lastTraining = await this.trainingsService.findOne({
//         where: {
//           client: user,
//           isCanceled: false,
//           date: MoreThanOrEqual(new Date(today.getTime() - ms('2weeks'))),
//         },
//       });
//
//       if (!lastTraining) {
//         await this.wazzupMessagingService.sendMessage(user.chatType.name, user.phone, messageTemplates.notifications.returnClient(, , , , frontendServer.url));
//       }
//     }
//   }
// }
