import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UserCreatedEvent } from '../events/user-created.event';

@Injectable()
export class UserCreatedListeners {
  private readonly logger = new Logger(UserCreatedListeners.name);
  constructor() {}

  @OnEvent('user.created', { async: true })
  async handleUserCreated(event: UserCreatedEvent) {
    this.logger.log(`User created: ${event.email}`);
  }
}
