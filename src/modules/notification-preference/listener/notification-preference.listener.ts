import { OnEvent } from "@nestjs/event-emitter";
import { Injectable, Logger } from "@nestjs/common";
import { NotificationPreferenceService } from "../notification-preference.service";
import { UserCreatedEvent } from "src/modules/users/events/user-created.event";

@Injectable()
export class NotificationPreferenceListener {
     private readonly logger = new Logger(NotificationPreferenceListener.name)

     constructor(private prefs: NotificationPreferenceService) { }

     @OnEvent('user.created')
     async handleCreateUser(event: UserCreatedEvent) {
          try {
               await this.prefs.createDefaultPreference(event.userId);

               this.logger.log(
                    `Notification preferences ready for user: ${event.userId}`,
               );
          } catch (err) {
               this.logger.error(`Failed to create notification preferences`, err);
          }
     }
}