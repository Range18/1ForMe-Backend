import { HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { BaseEntityService } from '#src/common/base-entity.service';
import { Notification } from '#src/core/notifications/entities/notification.entity';
import { MoreThan, MoreThanOrEqual, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiException } from '#src/common/exception-handler/api-exception';
import { AllExceptions } from '#src/common/exception-handler/exeption-types/all-exceptions';
import { SchedulerRegistry } from '@nestjs/schedule';
import { NotificationTypes } from '#src/core/notifications/types/notification-types.enum';
import { TrainingsService } from '#src/core/trainings/trainings.service';
import { WazzupMessagingService } from '#src/core/wazzup-messaging/wazzup-messaging.service';
import { messageTemplates } from '#src/core/wazzup-messaging/templates/message-templates';
import { dateToRecordString } from '#src/common/utilities/format-utc-date.func';
import { SubscriptionsService } from '#src/core/subscriptions/subscriptions.service';
import { parseHoursMinutes } from '#src/common/utilities/parse-hours-minutes.func';
import { NotificationRelatedEntities } from '#src/core/notifications/types/notification-related-entities.enum';
import ms from 'ms';
import { ClubSlots } from '#src/core/studio-slots/entities/club-slot.entity';
import { Training } from '#src/core/trainings/entities/training.entity';
import { Subscription } from '#src/core/subscriptions/entities/subscription.entity';
import { OnEvent } from '@nestjs/event-emitter';
import { TrainingCreatedEvent } from '#src/core/trainings/payloads/training-created-event.payload';
import NotificationExceptions = AllExceptions.NotificationExceptions;

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
    private readonly subscriptionsService: SubscriptionsService,
    private readonly trainingsService: TrainingsService,
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
    await this.save({
      relatedEntity: NotificationRelatedEntities.Subscription,
      relatedEntityId: String(subscription.id),
      notificationType: NotificationTypes.SubscriptionExpires,
      time: new Date(subscription.expireAt?.getTime() - ms('3d')),
    });
  }

  async onModuleInit(): Promise<void> {
    const notifications = await this.find({
      where: { time: MoreThanOrEqual(new Date()) },
    });

    for (const notification of notifications) {
      let timeout: NodeJS.Timeout;
      switch (notification.notificationType) {
        case NotificationTypes.TrainingComingUp:
          {
            const training = await this.trainingsService.findOne({
              where: { id: Number(notification.relatedEntityId) },
              relations: { client: { chatType: true }, slot: true },
            });

            if (training.isCanceled) continue;

            timeout = setTimeout(
              async () =>
                await this.wazzupMessagingService.sendMessage(
                  training.client.chatType.name ?? 'whatsapp',
                  training.client.phone,
                  messageTemplates.notifications.paidTrainingInTwoHours(
                    dateToRecordString(training.date, training.slot.beginning),
                  ),
                ),
              notification.time.getTime() - Date.now(),
            );
          }
          break;

        case NotificationTypes.TrainingFinished:
          {
            const training = await this.trainingsService.findOne({
              where: { id: Number(notification.relatedEntityId) },
              relations: { client: { chatType: true }, slot: true },
            });

            if (training.isCanceled) continue;

            const nextTrainings = await this.trainingsService.find({
              where: {
                date: MoreThan(training.date),
                isCanceled: false,
                client: training.client,
              },
              relations: { client: { chatType: true }, slot: true },
              order: { date: 'ASC' },
            });

            if (nextTrainings.length > 0) {
              timeout = setTimeout(
                async () =>
                  await this.wazzupMessagingService.sendMessage(
                    training.client.chatType.name ?? 'whatsapp',
                    training.client.phone,
                    messageTemplates.notifications.afterTrainingWithNextTraining(
                      dateToRecordString(
                        nextTrainings[0].date,
                        nextTrainings[0].slot.beginning,
                      ),
                    ),
                  ),
                notification.time.getTime() - Date.now(),
              );
            } else {
              timeout = setTimeout(
                async () =>
                  await this.wazzupMessagingService.sendMessage(
                    training.client.chatType.name ?? 'whatsapp',
                    training.client.phone,
                    messageTemplates.notifications.afterTraining(),
                  ),
                notification.time.getTime() - Date.now(),
              );
            }
          }
          break;

        case NotificationTypes.SubscriptionExpires:
          {
            const subscription = await this.subscriptionsService.findOne({
              where: { id: Number(notification.relatedEntityId) },
              relations: { client: { chatType: true }, trainer: true },
            });

            timeout = setTimeout(
              async () =>
                await this.wazzupMessagingService.sendMessage(
                  subscription.client.chatType.name ?? 'whatsapp',
                  subscription.client.phone,
                  messageTemplates.notifications.subscriptionCancellation(
                    subscription.trainer.getNameWithSurname(),
                  ),
                ),
              notification.time.getTime() - Date.now(),
            );
          }
          break;
      }

      this.schedulerRegistry.addTimeout(
        `Notification #${notification.id}`,
        timeout,
      );
    }
  }
}
