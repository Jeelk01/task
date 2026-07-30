import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { CURRENCY } from 'src/common/enum/currency.enum';
import { BaseEntity } from 'src/common/helper/entities/base.entity';
import { User } from 'src/modules/users/entities/user.entity';

export type MembershipDocument = HydratedDocument<Membership>;

@ObjectType()
@Schema({ timestamps: true, versionKey: false })
export class Membership extends BaseEntity {
  @Field(() => String, {
    description: 'Unique plan type identifier, e.g., FREE, PRO, ENTERPRISE',
  })
  @Prop({ required: true, unique: true })
  type: string;

  @Field(() => Float, { description: 'Base plan price' })
  @Prop({ required: true })
  price: number;

  @Field(() => CURRENCY, { description: 'Currency type' })
  @Prop({ enum: CURRENCY, required: true })
  currency: CURRENCY;

  @Field(() => String, {
    nullable: true,
    description: 'Optional plan description',
  })
  @Prop({ default: null })
  description?: string;

  @Field(() => [String], { nullable: true, description: 'Optional plan tags' })
  @Prop({ default: [] })
  tags?: string[];

  @Field(() => Boolean, { description: 'Is trial available?' })
  @Prop({ type: Boolean, default: false })
  isTrialAvailable: boolean;

  @Field(() => Int, { nullable: true, description: 'Trial duration in days' })
  @Prop({ type: Number, default: null })
  trialDurationDays?: number | null;

  @Field(() => Float, { nullable: true, description: 'Trial discounted price' })
  @Prop({ type: Number, default: null })
  trialPrice?: number | null;

  @Field(() => Int, { description: 'Max workspaces per account' })
  @Prop({ type: Number, default: 1 })
  maxWorkspaces: number;

  @Field(() => Int, { description: 'Max active devices per account' })
  @Prop({ type: Number, default: 1 })
  maxDevices: number;

  @Field(() => Int, { description: 'Max projects per workspace' })
  @Prop({ type: Number, required: true })
  maxProjectsPerWorkspace: number;

  @Field(() => Int, { description: 'Max users allowed per project' })
  @Prop({ type: Number, required: true })
  maxUsersPerProject: number;

  @Field(() => Boolean, { description: 'Can the plan be cancelled?' })
  @Prop({ default: false })
  isCancellable: boolean;

  @Field(() => Int, { description: 'Plan duration in days' })
  @Prop({ required: true })
  durationDays: number;

  @Field(() => ID, { description: 'User who created plan' })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Field(() => User, { description: 'Creator user document', nullable: true })
  creator?: User;

  @Field(() => Boolean, { description: 'Is plan currently active?' })
  @Prop({ default: true })
  isActive: boolean;
}

export const MembershipSchema = SchemaFactory.createForClass(Membership);

MembershipSchema.index({ createdBy: 1 });
