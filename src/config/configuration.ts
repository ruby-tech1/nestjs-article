import * as Joi from 'joi';

export interface ConfigInterface {
  app: {
    name: string;
    version: string;
    env: 'dev' | 'prod' | 'test';
    frontendHost: string;
  };
  database: {
    username: string;
    password: string;
    name: string;
    type: string;
    host: string;
    port: number;
  };
  email: {
    username: string;
    password: string;
    host: string;
    port: number;
  };
  queue: {
    rabbitMQUri: string;
    emailQueue: string;
  };
  token: {
    secret: string;
    jwtExpire: string;
    refreshExpire: string;
  };
}

export const validationSchema = Joi.object({
  APP_NAME: Joi.string().required(),
  APP_VERSION: Joi.string().required(),
  APP_PROFILE: Joi.string().valid('dev', 'prod', 'test').default('dev'),
  FRONTEND_HOST: Joi.string().required(),

  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),
  DB_TYPE: Joi.string().required(),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().port().required(),

  EMAIL_USERNAME: Joi.string().required(),
  EMAIL_PASSWORD: Joi.string().required(),
  EMAIL_HOST: Joi.string().required(),
  EMAIL_PORT: Joi.number().required(),

  EMAIL_QUEUE: Joi.string().required(),
  RABBITMQ_URI: Joi.string().required(),

  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRE: Joi.string().required(),
  REFRESH_EXPIRE: Joi.string().required(),
});

export const configuration = (): ConfigInterface => ({
  app: {
    name: process.env.APP_NAME!,
    version: process.env.APP_VERSION!,
    env: (process.env.APP_PROFILE || 'dev') as ConfigInterface['app']['env'],
    frontendHost: process.env.FRONTEND_HOST!,
  },
  database: {
    username: process.env.DB_USERNAME!,
    password: process.env.DB_PASSWORD!,
    name: process.env.DB_NAME!,
    type: process.env.DB_TYPE!,
    host: process.env.DB_HOST!,
    port: +process.env.DB_PORT!,
  },
  email: {
    username: process.env.EMAIL_USERNAME!,
    password: process.env.EMAIL_PASSWORD!,
    host: process.env.EMAIL_HOST!,
    port: +process.env.EMAIL_PORT!,
  },
  queue: {
    rabbitMQUri: process.env.RABBITMQ_URI!,
    emailQueue: process.env.EMAIL_QUEUE!,
  },
  token: {
    secret: process.env.JWT_SECRET!,
    jwtExpire: process.env.JWT_EXPIRE!,
    refreshExpire: process.env.REFRESH_EXPIRE!,
  },
});
