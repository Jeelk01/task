import { Field, Float, InputType, Int, ID } from '@nestjs/graphql';

@InputType()
export class UpdateMembershipInput {
  @Field(() => ID, { description: 'Plan ID' })
  _id: string;

  @Field(() => String, { nullable: true, description: 'Plan description' })
  description?: string;

  @Field(() => [String], { nullable: true, description: 'Plan tags' })
  tags?: string[];

  @Field(() => Float, { nullable: true, description: 'Plan price' })
  price?: number;

  @Field(() => Boolean, { nullable: true, description: 'Trial available?' })
  isTrialAvailable?: boolean;

  @Field(() => Int, { nullable: true, description: 'Trial days' })
  trialDurationDays?: number;

  @Field(() => Float, { nullable: true, description: 'Trial price' })
  trialPrice?: number;

  @Field(() => Boolean, { nullable: true, description: 'Plan cancellable?' })
  isCancellable?: boolean;

  @Field(() => Int, {
    nullable: true,
    description: 'Max projects per workspace',
  })
  maxProjectsPerWorkspace?: number;

  @Field(() => Int, { nullable: true, description: 'Max users per project' })
  maxUsersPerProject?: number;

  @Field(() => Boolean, { nullable: true, description: 'Active status' })
  isActive?: boolean;
}
