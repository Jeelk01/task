import * as JOI from 'joi';

export const validationSchema = JOI.object({
     NODE_ENV: JOI.string()
          .valid('development', 'production', 'test', 'provision')
          .default('development'),
     PORT: JOI.number().default(3000),

     // MongoDB
     MONGO_URI: JOI.string().required(),

     // GraphQL
     GRAPHQL_PLAYGROUND: JOI.boolean().default(false),
     GRAPHQL_INTROSPECTION: JOI.boolean().default(false),

     //JWT
     JWT_SECRET: JOI.string().required(),
     JWT_EXPIRES: JOI.string().default('1h'),
     JWT_REFRESH_SECRET: JOI.string().required(),
     JWT_REFRESH_EXPIRES: JOI.string().default('7d'),
     JWT_SECONDARY_SECRET: JOI.string().required(),
     JWT_SECONDARY_EXPIRES: JOI.string().default('7d'),
     JWT_PASSWORD_RESET_SECRET: JOI.string().required(),
     JWT_PASSWORD_RESET_EXPIRES_IN: JOI.string().default('1h'),

     // HASH
     PASSWORD_PEPPER: JOI.string().allow(''),
     SALT_ROUNDS: JOI.number().default(10),

     // Redis
     REDIS_HOST: JOI.string().default('localhost'),
     REDIS_PORT: JOI.number().default(6379),
     REDIS_PASSWORD: JOI.string().allow(''),
     REDIS_DB: JOI.number().default(0),
     REDIS_TLS: JOI.boolean().default(false),

     // Email
     MAIL_HOST: JOI.string().default('smtp.example.com'),
     MAIL_PORT: JOI.number().default(587),
     MAIL_USER: JOI.string().allow(''),
     MAIL_PASS: JOI.string().allow(''),
     MAIL_FROM: JOI.string().required(),

     // Upload
     UPLOAD_DIR: JOI.string().default('./uploads'),
     UPLOAD_MAX_FILE_SIZE: JOI.number().default(10 * 1024 * 1024), // 10 MB

});
