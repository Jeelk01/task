import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class CreateSubscriptionInput {
  @Field(() => ID, { description: 'User account ID' })
  userId: string;

  @Field(() => ID, { description: 'Plan to subscribe to' })
  planId: string;
}
