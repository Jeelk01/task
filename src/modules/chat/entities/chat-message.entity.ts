import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { BaseEntity } from 'src/common/helper/entities/base.entity';

export type ChatMessageDocument = HydratedDocument<ChatMessage>;

@Schema({ timestamps: true, versionKey: false })
export class ChatMessage extends BaseEntity {
  @Prop({ type: Types.ObjectId, ref: 'Workspace', required: true })
  workspaceId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  senderId: Types.ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop({ type: Boolean, default: false })
  isSystemMessage: boolean;
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);

ChatMessageSchema.index({ workspaceId: 1, createdAt: -1 });
