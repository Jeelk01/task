import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import databaseConfig from 'config/database.config';
import redisConfig from 'config/redis.config';
import uploadConfig from 'config/upload.config';
import graphqlConfig from 'config/graphql.config';
import mailConfig from 'config/mail.config';
import jwtConfig from 'config/jwt.config';
import hashConfig from 'config/hash.config';
import appConfig from 'config/app.config';
import { validationSchema } from 'config/validation';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { AppResolver } from './app.resolver';
import { RedisModule } from './modules/redis/redis.module';
import { UserModule } from './modules/users/users.module';
import { DatabaseModule } from 'database/database.module';
import { JwtModule } from './modules/jwt/jwt.module';
import { HashModule } from './modules/hash/hash.module';
import { NotificationPreferenceModule } from './modules/notification-preference/notification-preference.module';
import { ProjectModule } from './modules/project/project.module';
import { MembershipModule } from './modules/membership/membership.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { DeviceModule } from './modules/devices/device.module';
import { AuthModule } from './modules/auth/auth.module';
import { MailModule } from './modules/email/email.module';
import { BullModule } from '@nestjs/bullmq';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { GraphqlResponseInterceptor } from './common/interceptors/graphql-response.interceptor';
import { GraphqlErrorInterceptor } from './common/interceptors/graphql-error.interceptor';
import { WorkspaceModule } from './modules/workspace/workspace.module';
import { TaskModule } from './modules/task/task.module';
import { AttachmentModule } from './modules/attachments/attachment.module';
import { ChatModule } from './modules/chat/chat.module';
import { MeetingModule } from './modules/meeting/meeting.module';
import { NotificationModule } from './modules/notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        databaseConfig,
        redisConfig,
        uploadConfig,
        graphqlConfig,
        mailConfig,
        jwtConfig,
        hashConfig,
        appConfig,
      ],
      validationSchema: validationSchema,
    }),

    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('redis.host') || '127.0.0.1',
          port: config.get<number>('redis.port') || 6379,
          password: process.env.REDIS_PASSWORD || undefined,
          tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
        },
      }),
    }),

    GraphQLModule.forRootAsync({
      inject: [ConfigService],
      driver: ApolloDriver,
      useFactory: (config: ConfigService) => ({
        debug: config.get<boolean>('graphql.debug'),
        playground: config.get<boolean>('graphql.playground'),
        autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
        context: ({ req, res }) => ({ req, res }),
        cache: 'bounded',
        formatError: (error) => {
          return {
            message: error.message,
            code: error.extensions?.code,
            path: error.path,
          };
        },
      }),
    }),
    DatabaseModule,
    RedisModule,
    EventEmitterModule.forRoot(),
    MailModule,
    JwtModule,
    HashModule,
    AuthModule,
    UserModule,
    DeviceModule,
    NotificationPreferenceModule,
    MembershipModule,
    WorkspaceModule,
    SubscriptionModule,
    ProjectModule,
    TaskModule,
    AttachmentModule,
    ChatModule,
    MeetingModule,
    NotificationModule,
  ],
  providers: [
    AppService,
    AppResolver,
    {
      provide: APP_INTERCEPTOR,
      useClass: GraphqlResponseInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: GraphqlErrorInterceptor,
    },
  ],
})
export class AppModule {}
