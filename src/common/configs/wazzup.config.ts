import { get } from 'env-var';

export const wazzupConfig = {
  apiKey: get('WAZZUP_API_KEY').asString(),
};
