import {
  Args,
  ID,
  Mutation,
  Query,
  Resolver,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { SubscriptionService } from './subscription.service';
import { MemberShipService } from '../membership/membership.service';
import { CreateSubscriptionInput } from './dto/create-subscription.dto';
import { SubscriptionResponse } from './dto/subscription-response.dto';
import { AccountSubscription } from './entities/account-subscription.entity';
import { BulkDefaultSubscriptionResponse } from './dto/bulk-default-subscription-response.dto';
import { CreateDefaultSubscriptionsInput } from './dto/create-default-subscriptions-input.dto';
import { MultiSubscriptionResponse } from './dto/multi-subscription-response';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { Membership } from '../membership/entities/membership.entity';

@Resolver(() => AccountSubscription)
export class SubscriptionResolver {
  constructor(
    private readonly service: SubscriptionService,
    private readonly planService: MemberShipService,
  ) {}

  @UseGuards(AuthGuard)
  @Query(() => MultiSubscriptionResponse)
  async findMySubscriptions(@CurrentUser() user: User) {
    const subscriptions = await this.service.findSubscriptionByUserId(
      user._id.toString(),
    );

    return {
      code: 200,
      success: true,
      message: 'Subscriptions fetched successfully.',
      subscriptions,
    };
  }

  @ResolveField(() => Membership, { name: 'plan' })
  async plan(@Parent() subscription: AccountSubscription) {
    return this.planService.findById(subscription.planId.toString());
  }

  @Mutation(() => SubscriptionResponse)
  async createSubscription(@Args('input') input: CreateSubscriptionInput) {
    const subscription = await this.service.createSubscription(input);

    return {
      success: true,
      code: 201,
      message: 'Subscription created successfully',
      subscription,
    };
  }

  // Require Role -> Admin
  @Mutation(() => BulkDefaultSubscriptionResponse)
  async createDefaultSubscriptions(
    @Args('input') input: CreateDefaultSubscriptionsInput,
  ) {
    const response = await this.service.createDefaultSubscriptionsForUsers(
      input.userIds,
    );

    return {
      code: 201,
      message: 'Default subscriptions created successfully.',
      success: true,
      data: response,
    };
  }

  @Mutation(() => SubscriptionResponse)
  async cancelSubscription(@Args('id', { type: () => ID }) id: string) {
    const subscription = await this.service.cancelSubscription(id);

    return {
      success: true,
      code: 200,
      message: 'Subscription cancelled successfully',
      subscription,
    };
  }

  @UseGuards(AuthGuard)
  @Mutation(() => SubscriptionResponse)
  async changeSubscriptionPlan(
    @CurrentUser() user: User,
    @Args('planId', { type: () => ID }) planId: string,
  ) {
    const subscription = await this.service.changeSubscriptionPlan(
      user._id.toString(),
      planId,
    );

    return {
      success: true,
      code: 200,
      message: 'Plan changed successfully',
      subscription,
    };
  }
}
