import 'dotenv/config';
import { get } from 'env-var';

export const smsServiceConfig = {
  apiKey: get('API_KEY').required().asString(),
  phone: get('PHONE_NUMBER').required().asString(),
};
