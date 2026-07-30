import { Module } from '@nestjs/common';
import { NotificationPreferenceService } from './notification-preference.service';
import { NotificationPreferenceResolver } from './notification-preference.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import {
  NotificationPreference,
  NotificationPreferenceSchema,
} from './entities/Notification-preference.entity';
import { NotificationPreferenceListener } from './listener/notification-preference.listener';
import { UserModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: NotificationPreference.name,
        schema: NotificationPreferenceSchema,
      },
    ]),
    UserModule,
  ],
  providers: [
    NotificationPreferenceService,
    NotificationPreferenceResolver,
    NotificationPreferenceListener,
  ],
  exports: [NotificationPreferenceService],
})
export class NotificationPreferenceModule {}
