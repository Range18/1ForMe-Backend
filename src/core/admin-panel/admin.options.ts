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
