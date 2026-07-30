import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';

@ObjectType()
export class ChatMessageResponse {
  @Field(() => ID)
  _id: string;

  @Field(() => ID)
  workspaceId: string;

  @Field(() => User, { nullable: true })
  senderId?: User | null;

  @Field()
  content: string;

  @Field()
  isSystemMessage: boolean;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class PaginatedChatMessages {
  @Field(() => [ChatMessageResponse])
  messages: ChatMessageResponse[];

  @Field()
  totalItems: number;

  @Field()
  totalPages: number;

  @Field()
  page: number;

  @Field()
  limit: number;
}
