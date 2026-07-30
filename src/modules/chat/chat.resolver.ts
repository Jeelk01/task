import { Resolver, Query, Args, ID, Int } from '@nestjs/graphql';
import { ChatService } from './chat.service';
import { PaginatedChatMessages } from './dto/chat-response.dto';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { WorkspaceService } from '../workspace/workspace.service';
import { Types } from 'mongoose';

@Resolver()
export class ChatResolver {
  constructor(
    private readonly chatService: ChatService,
    private readonly workspaceService: WorkspaceService,
  ) {}

  @UseGuards(AuthGuard)
  @Query(() => PaginatedChatMessages)
  async getChatHistory(
    @Args('workspaceId', { type: () => ID }) workspaceId: string,
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 50 }) limit: number,
    @CurrentUser() user: User,
  ) {
    // Check membership
    const workspace = await this.workspaceService.findById(workspaceId);
    const userIdStr = String(user._id);

    if (!workspace || !workspace.members.some((m) => String(m) === userIdStr)) {
      throw new Error('Not authorized to view this chat history');
    }

    return this.chatService.findMessagesByWorkspace(workspaceId, page, limit);
  }
}
