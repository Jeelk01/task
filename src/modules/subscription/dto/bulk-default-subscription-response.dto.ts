import { Field, ID, ObjectType } from "@nestjs/graphql";
import { AccountSubscription } from "../entities/account-subscription.entity";
import { BaseResponse } from "src/common/helper/response/base.response";

@ObjectType()
export class BulkDefaultSubscriptionResult {
     @Field(() => [AccountSubscription])
     created: AccountSubscription[]

     @Field(() => [ID])
     skipped: string[]

     @Field(() => [ID])
     failed: string[]
}

@ObjectType()
export class BulkDefaultSubscriptionResponse extends BaseResponse {
     @Field(() => BulkDefaultSubscriptionResult)
     data: BulkDefaultSubscriptionResult
}