import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { BaseEntityService } from '#src/common/base-entity.service';
import { Notification } from '#src/core/notifications/entities/notification.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiException } from '#src/common/exception-handler/api-exception';
import { AllExceptions } from '#src/common/exception-handler/exeption-types/all-exceptions';
import { SchedulerRegistry } from '@nestjs/schedule';
import { NotificationTypes } from '#src/core/notifications/types/notification-types.enum';
import { WazzupMessagingService } from '#src/core/wazzup-messaging/wazzup-messaging.service';
import { parseHoursMinutes } from '#src/common/utilities/parse-hours-minutes.func';
import { NotificationRelatedEntities } from '#src/core/notifications/types/notification-related-entities.enum';
import ms from 'ms';
import { ClubSlots } from '#src/core/studio-slots/entities/club-slot.entity';
import { Training } from '#src/core/trainings/entities/training.entity';
import { Subscription } from '#src/core/subscriptions/entities/subscription.entity';
import { OnEvent } from '@nestjs/event-emitter';
import { TrainingCreatedEvent } from '#src/core/trainings/payloads/training-created-event.payload';
import { Gift } from '#src/core/gifts/entities/gift.entity';
import { GiftsService } from '#src/core/gifts/gifts.service';
import { giftMessageTemplates } from '#src/core/wazzup-messaging/templates/gift-message-templates';
import lt from 'long-timeout';
import console from 'node:console';
import NotificationExceptions = AllExceptions.NotificationExceptions;
import GiftExceptions = AllExceptions.GiftExceptions;

@Injectable()
export class NotificationsService
  extends BaseEntityService<Notification, 'NotificationExceptions'>
  implements OnModuleInit
{
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly wazzupMessagingService: WazzupMessagingService,
    private readonly giftsService: GiftsService,
  ) {
    super(
      notificationRepository,
      new ApiException(
        HttpStatus.NOT_FOUND,
        'NotificationExceptions',
        NotificationExceptions.NotFound,
      ),
    );
  }

  @OnEvent('training.created')
  async handleTrainingCreatedEvent(payload: TrainingCreatedEvent) {
    await this.setNotificationsAfterTrainingCreated(
      payload.training,
      payload.slot,
    );
  }

  @OnEvent('subscription.created')
  async handleSubscriptionCreatedEvent(subscription: Subscription) {
    await this.setNotificationsAfterSubscriptionCreated(subscription);
  }

  async setNotificationsAfterTrainingCreated(
    training: Training,
    slot: ClubSlots,
  ): Promise<void> {
    const [hours, minutes] = parseHoursMinutes(slot.beginning);
    const trainingTime = new Date(training.date);
    trainingTime.setHours(hours);
    trainingTime.setMinutes(minutes);

    await this.save({
      relatedEntity: NotificationRelatedEntities.Training,
      relatedEntityId: String(training.id),
      notificationType: NotificationTypes.TrainingComingUp,
      time: new Date(trainingTime.getTime() - ms('2h')),
    });

    await this.save({
      relatedEntity: NotificationRelatedEntities.Training,
      relatedEntityId: String(training.id),
      notificationType: NotificationTypes.TrainingFinished,
      time: new Date(trainingTime.getTime() + ms('15min')),
    });
  }

  async setNotificationsAfterSubscriptionCreated(
    subscription: Subscription,
  ): Promise<void> {
    if (subscription.expireAt) {
      await this.save({
        relatedEntity: NotificationRelatedEntities.Subscription,
        relatedEntityId: String(subscription.id),
        notificationType: NotificationTypes.SubscriptionExpires,
        time: new Date(new Date(subscription.expireAt).getTime() - ms('3d')),
      });
    }
  }

  @OnEvent('gift.set-message-timeout')
  async setNotificationsForGift(gift: Gift): Promise<void> {
    if (gift.sendAt) {
      const notification = await this.save({
        relatedEntity: NotificationRelatedEntities.Gift,
        relatedEntityId: gift.id,
        notificationType: NotificationTypes.Gift,
        time: new Date(gift.sendAt),
      });

      await this.setTimeoutForGiftNotification(gift, notification);
    } else {
      await this.wazzupMessagingService
        .sendMessage(
          gift.recipient?.chatType?.name ?? 'whatsapp',
          gift.recipient.phone,
          giftMessageTemplates.giftPaid(gift.promoCode),
        )
        .catch(Logger.error);

      if (gift.message)
        await this.wazzupMessagingService
          .sendMessage(
            gift.recipient?.chatType?.name ?? 'whatsapp',
            gift.recipient.phone,
            gift.message,
          )
          .catch(Logger.error);
    }
  }

  async setTimeoutForGiftNotification(
    gift: Gift,
    notification: Notification,
  ): Promise<void> {
    const defaultMessageTimeout = lt.setTimeout(
      () =>
        this.wazzupMessagingService
          .sendMessage(
            gift.recipient.chatType.name ?? 'whatsapp',
            gift.recipient.phone,
            giftMessageTemplates.giftPaid(gift.promoCode),
          )
          .catch(Logger.error),
      new Date(notification.time).getTime() - Date.now() - ms('5h'),
    );

    console.log(notification.time);
    console.log(new Date(notification.time).getTime() - Date.now() - ms('5h'));

    const customMessageTimeout = lt.setTimeout(() => {
      this.wazzupMessagingService
        .sendMessage(
          gift.recipient.chatType.name ?? 'whatsapp',
          gift.recipient.phone,
          gift.message,
        )
        .catch(Logger.error);
      console.log('custom ');
    }, new Date(notification.time).getTime() - Date.now() - ms('5h'));
    this.schedulerRegistry.addTimeout(
      `Gift Default Notification #${notification.id}`,
      defaultMessageTimeout,
    );

    this.schedulerRegistry.addTimeout(
      `Gift Custom Notification #${notification.id}`,
      customMessageTimeout,
    );
  }

  async onModuleInit(): Promise<void> {
    const notifications = await this.find({}, false);

    console.log(notifications.length);

    for (const notification of notifications) {
      if (notification.notificationType != NotificationTypes.Gift) continue;
      if (new Date(notification.time).getTime() - Date.now() - ms('5h') < 0)
        continue;
      console.log(
        new Date(notification.time).getTime() - Date.now() - ms('5h'),
      );

      const gift = await this.giftsService.findOne(
        {
          where: { id: notification.relatedEntityId },
          relations: { recipient: { chatType: true } },
        },
        false,
      );
      if (!gift) {
        Logger.error(GiftExceptions.NotFound, notification.relatedEntityId);
        continue;
      }
      try {
        await this.setTimeoutForGiftNotification(gift, notification);
      } catch (err) {
        Logger.error(err);
      }
    }

    // const notifications = await this.find(
    //   {
    //     where: { time: MoreThanOrEqual(new Date()) },
    //   },
    //   false,
    // );
    //
    // for (const notification of notifications) {
    //   let timeout: NodeJS.Timeout;
    //   switch (notification.notificationType) {
    //     case NotificationTypes.TrainingComingUp:
    //       {
    //         const training = await this.trainingsService.findOne(
    //           {
    //             where: { id: Number(notification.relatedEntityId) },
    //             relations: { client: { chatType: true }, slot: true },
    //           },
    //           false,
    //         );
    //
    //         if (!training || training.isCanceled) continue;
    //
    //         timeout = setTimeout(
    //           () =>
    //             this.wazzupMessagingService
    //               .sendMessage(
    //                 training.client.chatType.name ?? 'whatsapp',
    //                 training.client.phone,
    //                 messageTemplates.notifications.paidTrainingInTwoHours(
    //                   dateToRecordString(
    //                     training.date,
    //                     training.slot.beginning,
    //                   ),
    //                 ),
    //               )
    //               .catch(Logger.error),
    //           notification.time.getTime() - Date.now() - ms('5h'),
    //         );
    //       }
    //       break;
    //
    //     case NotificationTypes.TrainingFinished:
    //       {
    //         const training = await this.trainingsService.findOne(
    //           {
    //             where: { id: Number(notification.relatedEntityId) },
    //             relations: { client: { chatType: true }, slot: true },
    //           },
    //           false,
    //         );
    //
    //         if (!training || training.isCanceled) continue;
    //
    //         const nextTrainings = await this.trainingsService.find({
    //           where: {
    //             date: MoreThan(training.date),
    //             isCanceled: false,
    //             client: training.client,
    //           },
    //           relations: { client: { chatType: true }, slot: true },
    //           order: { date: 'ASC' },
    //         });
    //
    //         if (nextTrainings.length > 0) {
    //           timeout = setTimeout(
    //             async () =>
    //               await this.wazzupMessagingService
    //                 .sendMessage(
    //                   training.client.chatType.name ?? 'whatsapp',
    //                   training.client.phone,
    //                   messageTemplates.notifications.afterTrainingWithNextTraining(
    //                     dateToRecordString(
    //                       nextTrainings[0].date,
    //                       nextTrainings[0].slot.beginning,
    //                     ),
    //                   ),
    //                 )
    //                 .catch(Logger.error),
    //             notification.time.getTime() - Date.now() - ms('5h'),
    //           );
    //         } else {
    //           timeout = setTimeout(
    //             async () =>
    //               await this.wazzupMessagingService
    //                 .sendMessage(
    //                   training.client.chatType.name ?? 'whatsapp',
    //                   training.client.phone,
    //                   messageTemplates.notifications.afterTraining(),
    //                 )
    //                 .catch(Logger.error),
    //             notification.time.getTime() - Date.now() - ms('5h'),
    //           );
    //         }
    //       }
    //       break;
    //
    //     case NotificationTypes.SubscriptionExpires:
    //       {
    //         const subscription = await this.subscriptionsService.findOne(
    //           {
    //             where: { id: Number(notification.relatedEntityId) },
    //             relations: { client: { chatType: true }, trainer: true },
    //           },
    //           false,
    //         );
    //
    //         timeout = setTimeout(
    //           async () =>
    //             await this.wazzupMessagingService
    //               .sendMessage(
    //                 subscription.client.chatType.name ?? 'whatsapp',
    //                 subscription.client.phone,
    //                 messageTemplates.notifications.subscriptionCancellation(
    //                   subscription.trainer.getNameWithSurname(),
    //                 ),
    //               )
    //               .catch(Logger.error),
    //           notification.time.getTime() - Date.now() - ms('5h'),
    //         );
    //       }
    //       break;
    //   }
    //
    //   this.schedulerRegistry.addTimeout(
    //     `Notification #${notification.id}`,
    //     timeout,
    //   );
    // }
  }
}
