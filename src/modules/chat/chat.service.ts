import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  ChatMessage,
  ChatMessageDocument,
} from './entities/chat-message.entity';
import { Model, Types } from 'mongoose';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(ChatMessage.name) private model: Model<ChatMessageDocument>,
  ) {}

  async saveMessage(
    workspaceId: string,
    senderId: string,
    content: string,
    isSystem = false,
  ) {
    return this.model.create({
      workspaceId: new Types.ObjectId(workspaceId),
      senderId: new Types.ObjectId(senderId),
      content,
      isSystemMessage: isSystem,
    });
  }

  async findMessagesByWorkspace(workspaceId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const [messages, totalItems] = await Promise.all([
      this.model
        .find({ workspaceId: new Types.ObjectId(workspaceId) })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('senderId', 'name email avatar')
        .lean(),
      this.model.countDocuments({
        workspaceId: new Types.ObjectId(workspaceId),
      }),
    ]);

    return {
      messages: messages.reverse(), // Return in chronological order
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      page,
      limit,
    };
  }
}
