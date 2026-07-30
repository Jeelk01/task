import { Field, ObjectType } from '@nestjs/graphql';
import { BaseResponse } from 'src/common/helper/response/base.response';
import { AccountSubscription } from '../entities/account-subscription.entity';

@ObjectType()
export class MultiSubscriptionResponse extends BaseResponse {
  @Field(() => [AccountSubscription], { nullable: true })
  subscriptions?: AccountSubscription | null;
}
