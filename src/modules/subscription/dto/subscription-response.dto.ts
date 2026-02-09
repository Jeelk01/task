import { ObjectType, Field } from "@nestjs/graphql";
import { BaseResponse } from "src/common/helper/response/base.response";
import { AccountSubscription } from "../entities/account-subscription.entity";

@ObjectType()
export class SubscriptionResponse extends BaseResponse {

     @Field(() => AccountSubscription, { nullable: true, description: "Subscription details" })
     subscription?: AccountSubscription;
}
