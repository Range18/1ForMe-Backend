import 'dotenv/config';
import { get } from 'env-var';

export const adminConfig = {
  login: get('LOGIN').required().asString(),
  password: get('PASSWORD').required().asString(),
};
