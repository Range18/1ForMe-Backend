import { authenticate } from '#src/core/admin-panel/admin-authenticate';
import { UserEntity } from '#src/core/users/entity/user.entity';
import { RolesEntity } from '#src/core/roles/entity/roles.entity';
import { SessionEntity } from '#src/core/session/session.entity';
import { AssetEntity } from '#src/core/assets/entities/asset.entity';

export const adminOptions = {
  adminJsOptions: {
    rootPath: '/admin',
    resources: [UserEntity, RolesEntity, SessionEntity, AssetEntity],
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
