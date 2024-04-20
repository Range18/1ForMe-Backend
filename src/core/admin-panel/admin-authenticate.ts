import { adminConfig } from '#src/common/configs/admin.config';
import { CurrentAdmin } from 'adminjs';

export const authenticate = async (email: string, password: string) => {
  if (adminConfig.login === email && adminConfig.password === password) {
    return Promise.resolve({
      email: adminConfig.login,
    } as CurrentAdmin);
  }

  return null;
};
