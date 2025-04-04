import { authenticate } from '#src/core/admin-panel/admin-authenticate';
import { UserEntity } from '#src/core/users/entity/user.entity';
import { RolesEntity } from '#src/core/roles/entity/roles.entity';
import { SessionEntity } from '#src/core/session/session.entity';
import { AssetEntity } from '#src/core/assets/entities/asset.entity';
import { Category } from '#src/core/categories/entity/categories.entity';
import { City } from '#src/core/city/entity/cities.entity';
import { Clubs } from '#src/core/clubs/entity/clubs.entity';
import { Sport } from '#src/core/sports/entity/sports.entity';
import { Studio } from '#src/core/studios/entities/studio.entity';
import { Tariff } from '#src/core/tariffs/entity/tariff.entity';
import { TrainingType } from '#src/core/training-type/entity/training-type.entity';
import { Training } from '#src/core/trainings/entities/training.entity';
import { UserComment } from '#src/core/comments/entity/comment.entity';
import { Transaction } from '#src/core/transactions/entities/transaction.entity';
import { Subscription } from '#src/core/subscriptions/entities/subscription.entity';
import { ClubSlots } from '#src/core/studio-slots/entities/club-slot.entity';
import { Slot } from '#src/core/trainer-slots/entities/slot.entity';
import { ChatTypes } from '#src/core/chat-types/entities/chat-type.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { GiftCard } from '#src/core/gift-cards/entities/gift-card.entity';
import { SubscriptionCard } from '#src/core/subscription-cards/entities/subscription-card.entity';

export const adminOptions = {
  adminJsOptions: {
    rootPath: '/admin',
    resources: [
      UserEntity,
      RolesEntity,
      SessionEntity,
      AssetEntity,
      Category,
      City,
      Clubs,
      Sport,
      Studio,
      Tariff,
      TrainingType,
      Training,
      UserComment,
      Transaction,
      Subscription,
      Slot,
      ClubSlots,
      ChatTypes,
      Notification,
      GiftCard,
      SubscriptionCard,
    ],
  },
  auth: {
    authenticate,
    cookieName: 'adminjs',
    cookiePassword: 'asdlak2e',
  },
  sessionOptions: {
    resave: true,
    saveUninitialized: true,
    secret: 'askda8330',
  },
};
