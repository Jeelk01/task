import { registerEnumType } from '@nestjs/graphql';

export enum SubscriptionStatus {
  TRIALING = 'trialing',
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

registerEnumType(SubscriptionStatus, {
  name: 'SUBSCRIPTION_STATUS',
  description: 'subscription status',
});
