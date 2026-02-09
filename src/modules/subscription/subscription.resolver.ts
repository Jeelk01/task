import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";
import { SubscriptionService } from "./subscription.service";
import { CreateSubscriptionInput } from "./dto/create-subscription.dto";
import { SubscriptionResponse } from "./dto/subscription-response.dto";
import { AccountSubscription } from "./entities/account-subscription.entity";
import { BulkDefaultSubscriptionResponse } from "./dto/bulk-default-subscription-response.dto";
import { CreateDefaultSubscriptionsInput } from "./dto/create-default-subscriptions-input.dto";
import { MultiSubscriptionResponse } from "./dto/multi-subscription-response";
import { UseGuards } from "@nestjs/common";
import { AuthGuard } from "src/common/guard/auth.guard";

@Resolver(() => AccountSubscription)
export class SubscriptionResolver {

     constructor(private readonly service: SubscriptionService) { }

     @UseGuards(AuthGuard)
     @Query(() => MultiSubscriptionResponse)
     async findMySubscriptions(@Args('input') input: string) {
          const subscriptions = await this.service.findSubscriptionByUserId(input)

          return {
               code: 200,
               success: true,
               message: 'Subscriptions fetched successfully.',
               subscriptions
          }
     }

     @Mutation(() => SubscriptionResponse)
     async createSubscription(
          @Args("input") input: CreateSubscriptionInput
     ) {
          const subscription = await this.service.createSubscription(input);

          return {
               success: true,
               code: 201,
               message: "Subscription created successfully",
               subscription
          };
     }

     // Require Role -> Admin
     @Mutation(() => BulkDefaultSubscriptionResponse)
     async createDefaultSubscriptions(@Args('input') input: CreateDefaultSubscriptionsInput) {
          const response = await this.service.createDefaultSubscriptionsForUsers(input.userIds)

          return {
               code: 201,
               message: 'Default subscriptions created successfully.',
               success: true,
               data: response
          }
     }


     @Mutation(() => SubscriptionResponse)
     async cancelSubscription(
          @Args("id", { type: () => ID }) id: string
     ) {
          const subscription = await this.service.cancelSubscription(id);

          return {
               success: true,
               code: 200,
               message: "Subscription cancelled successfully",
               subscription
          };
     }
}
