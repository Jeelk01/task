import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, Logger } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtService } from '../jwt/jwt.service';
import { WorkspaceService } from '../workspace/workspace.service';
import { UserService } from '../users/users.service';
import { Types } from 'mongoose';
import { OnEvent } from '@nestjs/event-emitter';
import { WorkspaceRole } from 'src/common/enum/workspace-role.enum';

import { WsJwtGuard } from './guards/ws-jwt.guard';

@UseGuards(WsJwtGuard)
@WebSocketGateway({
  namespace: 'chat',
  cors: {
    origin:
      (process.env.CORS_ORIGIN || '*') === '*'
        ? true
        : process.env.CORS_ORIGIN!.split(',').map((o) => o.trim()),
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  // Map<workspaceId, Map<userId, connectionCount>>
  private workspaceUserCounts = new Map<string, Map<string, number>>();

  constructor(
    private chatService: ChatService,
    private userService: UserService,
    private jwtService: JwtService,
    private workspaceService: WorkspaceService,
  ) {}

  @UseGuards(WsJwtGuard)
  async handleConnection(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client ${client.id} connected to chat namespace`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client ${client.id} disconnected`);
    const { workspaceId, userId } = client.data;
    if (workspaceId && userId && this.workspaceUserCounts.has(workspaceId)) {
      const userMap = this.workspaceUserCounts.get(workspaceId);
      if (userMap && userMap.has(userId)) {
        const newCount = userMap.get(userId)! - 1;
        if (newCount <= 0) {
          userMap.delete(userId);
        } else {
          userMap.set(userId, newCount);
        }
        this.server
          .to(`workspace_${workspaceId}`)
          .emit('onlineUsers', Array.from(userMap.keys()));
      }
    }
  }

  @SubscribeMessage('joinWorkspace')
  async handleJoinWorkspace(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { workspaceId: string },
  ) {
    const { workspaceId } = data;
    const userId = client.data.userId;

    // Check workspace membership
    const isMember = await this.workspaceService.findById(workspaceId);
    if (!isMember || !isMember.members.includes(new Types.ObjectId(userId))) {
      client.emit('error', 'You are not a member of this workspace');
      return;
    }

    client.join(`workspace_${workspaceId}`);
    this.logger.log(`User ${userId} joined room workspace_${workspaceId}`);

    // Broadcast system message
    try {
      const user = await this.userService.findById(userId);
      if (user) {
        const systemMsg = await this.chatService.saveMessage(
          workspaceId,
          userId,
          `${user.name} joined the workspace chat`,
          true,
        );
        this.server
          .to(`workspace_${workspaceId}`)
          .emit('newMessage', systemMsg);
      }
    } catch (e) {
      this.logger.error(`Failed to send join notification: ${e.message}`);
    }

    // Send join confirmation
    client.emit('joinedRoom', { workspaceId });

    // Track online user presence
    const userMap =
      this.workspaceUserCounts.get(workspaceId) || new Map<string, number>();
    userMap.set(userId, (userMap.get(userId) || 0) + 1);
    this.workspaceUserCounts.set(workspaceId, userMap);
    client.data.workspaceId = workspaceId;

    this.server
      .to(`workspace_${workspaceId}`)
      .emit('onlineUsers', Array.from(userMap.keys()));
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { workspaceId: string; content: string },
  ) {
    const { workspaceId, content } = data;
    const userId = client.data.userId;

    const role = await this.workspaceService.getMemberRole(workspaceId, userId);
    if (role === WorkspaceRole.VIEWER) {
      client.emit('error', 'Viewers cannot send messages in this workspace');
      return;
    }

    const message = await this.chatService.saveMessage(
      workspaceId,
      userId,
      content,
    );
    const populatedMessage = await message.populate(
      'senderId',
      'name email avatar',
    );

    this.server
      .to(`workspace_${workspaceId}`)
      .emit('newMessage', populatedMessage);
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { workspaceId: string; isTyping: boolean },
  ) {
    const { workspaceId, isTyping } = data;
    const userId = client.data.userId;

    const role = await this.workspaceService.getMemberRole(workspaceId, userId);
    if (role === WorkspaceRole.VIEWER) return;

    client.to(`workspace_${workspaceId}`).emit('userTyping', {
      userId,
      isTyping,
    });
  }

  @OnEvent('device.logout')
  handleDeviceLogout(payload: { deviceId: string }) {
    this.server.emit('forceLogout', { deviceId: payload.deviceId });
  }

  @OnEvent('device.logoutAllExcept')
  handleDeviceLogoutAllExcept(payload: {
    userId: string;
    exceptDeviceId: string;
  }) {
    this.server.emit('forceLogoutAllExcept', {
      userId: payload.userId,
      exceptDeviceId: payload.exceptDeviceId,
    });
  }

  @OnEvent('device.logoutAll')
  handleDeviceLogoutAll(payload: { userId: string }) {
    this.server.emit('forceLogoutAll', { userId: payload.userId });
  }
}
