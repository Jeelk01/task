import { Field, GraphQLISODateTime, ID, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { BaseEntity } from 'src/common/helper/entities/base.entity';
import { User } from 'src/modules/users/entities/user.entity';

@ObjectType()
@Schema({ timestamps: true, versionKey: false })
export class Device extends BaseEntity {
  @Field(() => ID, { description: 'userId for which these device login' })
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  userId: Types.ObjectId;

  @Field(() => User, { nullable: true, description: 'User document' })
  user?: User | null;

  @Field(() => String, { description: 'device id' })
  @Prop({ required: true, index: true })
  deviceId: string;

  @Field(() => String, { nullable: true, description: 'Device name' })
  @Prop()
  deviceName?: string;

  @Field(() => String, { nullable: true, description: 'device browser' })
  @Prop()
  userAgent?: string;

  @Field(() => String, { nullable: true, description: 'device' })
  @Prop()
  ip?: string;

  @Prop({ required: true })
  refreshTokenHash: string;

  @Prop({ required: true, index: true })
  jti: string;

  @Field(() => GraphQLISODateTime)
  @Prop({ default: Date.now })
  lastLoginAt: Date;

  @Prop({ required: true })
  expiresAt?: Date;

  @Prop({ nullable: true, default: null })
  socketId: string;

  @Prop({ default: false })
  isRevoked: boolean;

  @Field(() => Boolean, { description: 'if devices is blocked or what' })
  @Prop({ default: false })
  isBlocked: boolean;

  @Field(() => String, { nullable: true, description: 'Reason for revocation' })
  @Prop({ default: null })
  revocationReason?: string;
}

export const DeviceSchema = SchemaFactory.createForClass(Device);

DeviceSchema.index(
  { userId: 1, deviceId: 1 },
  {
    unique: true,
    partialFilterExpression: { isRevoked: false },
  },
);

DeviceSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // expireAfterSeconds will auto clean the document
