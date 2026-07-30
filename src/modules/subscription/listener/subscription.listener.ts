import { Injectable, Logger } from '@nestjs/common';
import { SubscriptionService } from '../subscription.service';
import { OnEvent } from '@nestjs/event-emitter';
import { UserCreatedEvent } from 'src/modules/users/events/user-created.event';

@Injectable()
export class SubscriptionListener {
  private readonly logger = new Logger(SubscriptionListener.name);
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @OnEvent('user.created')
  async handleUserCreated(event: UserCreatedEvent) {
    try {
      const subscription =
        await this.subscriptionService.createDefaultSubscriptionPlan(
          event.userId,
        );
      this.logger.log(`Default Subscription Plan created for ${event.email}`);
    } catch (err: any) {
      this.logger.error(
        `Failed to create default subscriptionPlan for user ${event.email}`,
        err,
      );
    }
  }
}
