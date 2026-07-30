import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Workspace } from 'src/modules/workspace/entities/workspace.entity';
import { User } from 'src/modules/users/entities/user.entity';

export enum MeetingStatus {
  SCHEDULED = 'SCHEDULED',
  ONGOING = 'ONGOING',
  ENDED = 'ENDED',
  CANCELLED = 'CANCELLED',
}

registerEnumType(MeetingStatus, { name: 'MeetingStatus' });

@ObjectType()
@Schema({ timestamps: true })
export class Meeting extends Document {
  @Field(() => ID)
  declare _id: Types.ObjectId;

  @Field()
  @Prop({ required: true })
  title: string;

  @Field({ nullable: true })
  @Prop()
  description?: string;

  @Field(() => ID)
  @Prop({ type: Types.ObjectId, ref: 'Workspace', required: true })
  workspaceId: Types.ObjectId;

  @Field(() => ID)
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  hostId: Types.ObjectId;

  @Field(() => Workspace, { nullable: true })
  workspace?: Workspace;

  @Field(() => User, { nullable: true })
  host?: User;

  @Field()
  @Prop({ required: true })
  startTime: Date;

  @Field({ nullable: true })
  @Prop()
  endTime?: Date;

  @Field(() => MeetingStatus)
  @Prop({ type: String, enum: MeetingStatus, default: MeetingStatus.SCHEDULED })
  status: MeetingStatus;
}

export const MeetingSchema = SchemaFactory.createForClass(Meeting);
