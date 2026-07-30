import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum NotificationType {
  INVITE_PROJECT = 'INVITE_PROJECT',
  INVITE_WORKSPACE = 'INVITE_WORKSPACE',
  MEETING_START = 'MEETING_START',
  TASK_ASSIGNED = 'TASK_ASSIGNED',
}

registerEnumType(NotificationType, {
  name: 'NotificationType',
});

@ObjectType()
@Schema({ timestamps: true })
export class Notification extends Document {
  @Field(() => ID)
  declare _id: Types.ObjectId;

  @Field(() => ID)
  @Prop({ type: Types.ObjectId, required: true })
  recipientId: Types.ObjectId;

  @Field(() => NotificationType)
  @Prop({ required: true, enum: NotificationType })
  type: NotificationType;

  @Field(() => GraphQLJSON, { nullable: true })
  @Prop({ type: Object })
  data: any;

  @Field()
  @Prop({ default: false })
  isRead: boolean;

  @Field()
  createdAt: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
