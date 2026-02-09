// email.listeners.ts
import { OnEvent } from '@nestjs/event-emitter';
import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from '../email.service';
import { UserLoginEvent } from 'src/modules/auth/events/user-login.event';
import { NotificationPreferenceService } from 'src/modules/notification-preference/notification-preference.service';
import { Device } from 'src/modules/devices/entities/device.entity';

@Injectable()
export class EmailListeners {
     private readonly logger = new Logger(EmailListeners.name);

     constructor(private readonly email: EmailService, private readonly notification: NotificationPreferenceService) { }

     @OnEvent('user.created')
     async handleUserCreate(event: {
          userId: string;
          email: string;
          name: string;
     }) {
          try {

               await this.email.sendVerificationMail({
                    userId: event.userId,
                    email: event.email,
                    name: event.name,
                    expiresIn: '3 days',
               });

               this.logger.log(`Verification email queued → ${event.email}`);
          } catch (err) {
               this.logger.error(err);
          }
     }

     @OnEvent('user.login')
     async handleUserLogin(event: { userId: string, email: string, name: string, device: Device, token: string }) {
          const isAllowed = await this.notification.checkPref(event.userId, 'securityAlerts')

          // if (isAllowed) {
          //      this.email.sendLoginAlertMail({ ...event })
          // }
     }
}
