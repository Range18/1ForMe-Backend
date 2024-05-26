import { get } from 'env-var';

export const tinkoffConfig = {
  terminalKey: get('TINKOFF_TERMINAL_KEY').asString(),
  terminalPassword: get('TINKOFF_TERMINAL_PASSWORD').asString(),
  notificationURL: get('TINKOFF_NOTIFICATION_URL').asUrlString(),
};
