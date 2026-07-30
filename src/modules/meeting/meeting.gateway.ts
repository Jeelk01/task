import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, Logger } from '@nestjs/common';
import { WsJwtGuard } from '../chat/guards/ws-jwt.guard';
import { MeetingService } from './meeting.service';
import { MeetingStatus } from './entities/meeting.entity';

@WebSocketGateway({
  namespace: 'meeting',
  cors: {
    origin: '*',
  },
})
export class MeetingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MeetingGateway.name);

  // Map of meetingId -> list of { socketId, userId, user: any, isAudioMuted, isVideoMuted, isScreenSharing }
  private roomParticipants = new Map<
    string,
    Array<{
      socketId: string;
      userId: string;
      user?: any;
      isAudioMuted: boolean;
      isVideoMuted: boolean;
      isScreenSharing: boolean;
    }>
  >();

  constructor(private meetingService: MeetingService) {}

  @UseGuards(WsJwtGuard)
  handleConnection(client: Socket) {
    this.logger.log(`Client connected to meeting namespace: ${client.id}`);
  }

  private handleUserLeave(client: Socket, meetingId?: string) {
    if (meetingId) {
      const participants = this.roomParticipants.get(meetingId);
      const p = participants?.find((x) => x.socketId === client.id);
      this.removeParticipant(meetingId, client.id);
      client.leave(`meeting_${meetingId}`);
      client.to(`meeting_${meetingId}`).emit('userLeft', {
        userId: client.data?.userId,
        socketId: client.id,
        user: p?.user,
      });
    } else {
      // Clean up from all rooms on disconnect
      for (const [mId, participants] of this.roomParticipants.entries()) {
        const p = participants.find((x) => x.socketId === client.id);
        if (p) {
          this.removeParticipant(mId, client.id);
          this.server.to(`meeting_${mId}`).emit('userLeft', {
            userId: client.data?.userId,
            socketId: client.id,
            user: p.user,
          });
        }
      }
    }
  }

  private removeParticipant(meetingId: string, socketId: string) {
    const participants = this.roomParticipants.get(meetingId);
    if (participants) {
      const updated = participants.filter((p) => p.socketId !== socketId);
      if (updated.length === 0) {
        this.roomParticipants.delete(meetingId);
      } else {
        this.roomParticipants.set(meetingId, updated);
      }
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected from meeting: ${client.id}`);
    this.handleUserLeave(client);
  }

  @SubscribeMessage('joinMeeting')
  async handleJoinMeeting(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      meetingId: string;
      user?: any;
      isAudioMuted?: boolean;
      isVideoMuted?: boolean;
      isScreenSharing?: boolean;
    },
  ) {
    const {
      meetingId,
      user: joinedUser,
      isAudioMuted = false,
      isVideoMuted = false,
      isScreenSharing = false,
    } = data;
    const userId = client.data?.userId;

    try {
      const meeting = await this.meetingService.findById(meetingId);

      if (
        meeting.status === MeetingStatus.ENDED ||
        meeting.status === MeetingStatus.CANCELLED
      ) {
        client.emit('meetingError', {
          message: 'This meeting has already ended or been cancelled.',
        });
        return;
      }

      if (meeting.status === MeetingStatus.SCHEDULED) {
        await this.meetingService.updateStatus(
          meetingId,
          MeetingStatus.ONGOING,
        );
      }
    } catch (err) {
      client.emit('meetingError', { message: 'Meeting not found.' });
      return;
    }

    client.join(`meeting_${meetingId}`);

    let participants = this.roomParticipants.get(meetingId);
    if (!participants) {
      participants = [];
      this.roomParticipants.set(meetingId, participants);
    }

    // Prevent duplicates
    const existingIndex = participants.findIndex(
      (p) => p.socketId === client.id,
    );
    const newParticipantData = {
      socketId: client.id,
      userId,
      user: joinedUser,
      isAudioMuted,
      isVideoMuted,
      isScreenSharing,
    };
    if (existingIndex === -1) {
      participants.push(newParticipantData);
    } else {
      participants[existingIndex] = {
        ...participants[existingIndex],
        ...newParticipantData,
      };
    }

    // Inform the new user about existing participants
    const others = participants.filter((p) => p.socketId !== client.id);
    client.emit('existingParticipants', others);

    // Notify others in the meeting
    client.to(`meeting_${meetingId}`).emit('userJoined', {
      userId,
      socketId: client.id,
      user: joinedUser,
      isAudioMuted,
      isVideoMuted,
      isScreenSharing,
    });

    this.logger.log(
      `User ${userId} (${client.id}) joined meeting ${meetingId}`,
    );
  }

  @SubscribeMessage('signal')
  handleSignal(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { targetSocketId: string; signal: any },
  ) {
    const { targetSocketId, signal } = data;
    const fromSocketId = client.id;

    this.server.to(targetSocketId).emit('signal', {
      fromSocketId,
      signal,
    });
  }

  @SubscribeMessage('leaveMeeting')
  handleLeaveMeeting(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { meetingId: string },
  ) {
    this.handleUserLeave(client, data.meetingId);
  }

  @SubscribeMessage('updateMediaState')
  handleUpdateMediaState(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      meetingId: string;
      isAudioMuted: boolean;
      isVideoMuted: boolean;
      isScreenSharing?: boolean;
    },
  ) {
    const {
      meetingId,
      isAudioMuted,
      isVideoMuted,
      isScreenSharing = false,
    } = data;

    // Update the cache map
    const participants = this.roomParticipants.get(meetingId);
    if (participants) {
      const p = participants.find((x) => x.socketId === client.id);
      if (p) {
        p.isAudioMuted = isAudioMuted;
        p.isVideoMuted = isVideoMuted;
        p.isScreenSharing = isScreenSharing;
      }
    }

    client.to(`meeting_${meetingId}`).emit('mediaStateChanged', {
      socketId: client.id,
      userId: client.data?.userId,
      isAudioMuted,
      isVideoMuted,
      isScreenSharing,
    });
  }

  @SubscribeMessage('raiseHand')
  handleRaiseHand(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { meetingId: string; isRaised: boolean },
  ) {
    client.to(`meeting_${data.meetingId}`).emit('handRaised', {
      socketId: client.id,
      isRaised: data.isRaised,
    });
  }

  @SubscribeMessage('muteAll')
  handleMuteAll(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { meetingId: string },
  ) {
    client.to(`meeting_${data.meetingId}`).emit('forceMuteAudio', {
      bySocketId: client.id,
    });
  }

  broadcastMeetingEnded(meetingId: string) {
    this.server.to(`meeting_${meetingId}`).emit('meetingEnded', { meetingId });
    this.roomParticipants.delete(meetingId);
    this.server.in(`meeting_${meetingId}`).socketsLeave(`meeting_${meetingId}`);
  }
}
