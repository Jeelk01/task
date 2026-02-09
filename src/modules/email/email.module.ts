// mail.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './email.service';
import { EmailProcessor } from './email.processor';
import { EmailQueueModule } from './email.queue';
import { EmailListeners } from './listeners/email.listener';
import { NotificationPreferenceModule } from '../notification-preference/notification-preference.module';

@Module({
  imports: [
    ConfigModule,
    EmailQueueModule,
    NotificationPreferenceModule
  ],
  providers: [
    EmailService,
    EmailProcessor,
    EmailListeners,
  ],
  exports: [EmailService],
})
export class MailModule { }
