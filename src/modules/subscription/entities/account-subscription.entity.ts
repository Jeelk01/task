import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { BaseEntity } from 'src/common/helper/entities/base.entity';
import { SubscriptionStatus } from 'src/common/enum/subscription-status.enum';
import { CURRENCY } from 'src/common/enum/currency.enum';
import { Membership } from 'src/modules/membership/entities/membership.entity';

export type AccountSubscriptionDocument = HydratedDocument<AccountSubscription>;

@ObjectType()
@Schema({ timestamps: true, versionKey: false })
export class AccountSubscription extends BaseEntity {
  @Field(() => ID, { description: 'User account this subscription belongs to' })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Field(() => ID, { description: 'Membership plan subscribed to' })
  @Prop({ type: Types.ObjectId, ref: 'Membership', required: true })
  planId: Types.ObjectId;

  @Field(() => Membership, {
    nullable: true,
    description: 'Membership plan details',
  })
  plan?: Membership;

  @Field(() => SubscriptionStatus, {
    description: 'Subscription lifecycle status',
  })
  @Prop({ enum: SubscriptionStatus, default: SubscriptionStatus.ACTIVE })
  status: SubscriptionStatus;

  @Field(() => Date, { nullable: true, description: 'Subscription start date' })
  @Prop({ type: Date, default: null })
  startDate?: Date | null;

  @Field(() => Date, {
    nullable: true,
    description: 'Subscription end / renewal date',
  })
  @Prop({ type: Date, default: null })
  endDate?: Date | null;

  @Field(() => Float, { description: 'Price locked at time of purchase' })
  @Prop({ required: true })
  priceAtPurchase: number;

  @Field(() => CURRENCY, { description: 'Currency code at purchase' })
  @Prop({ required: true })
  currency: CURRENCY;

  @Field(() => Int, { description: 'Max workspaces this account can create' })
  @Prop({ required: true })
  maxWorkspaces: number;

  @Field(() => Int, { description: 'Max allowed devices at once' })
  @Prop({ required: true })
  maxDevices: number;

  @Field(() => Int, { description: 'Max projects per workspace' })
  @Prop({ required: true })
  maxProjectsPerWorkspace: number;

  @Field(() => Int, { description: 'Max users per project' })
  @Prop({ required: true })
  maxUsersPerProject: number;
}

export const AccountSubscriptionSchema =
  SchemaFactory.createForClass(AccountSubscription);

AccountSubscriptionSchema.index(
  { userId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING] },
    },
  },
);
