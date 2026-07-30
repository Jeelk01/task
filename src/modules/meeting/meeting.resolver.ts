import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { MeetingService } from './meeting.service';
import { MeetingGateway } from './meeting.gateway';
import { Meeting, MeetingStatus } from './entities/meeting.entity';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../common/guard/auth.guard';
import { CurrentUser } from '../../common/decorator/current-user.decorator';
import { WorkspaceService } from '../workspace/workspace.service';
import { UserService } from '../users/users.service';
import { Workspace } from '../workspace/entities/workspace.entity';
import { User } from '../users/entities/user.entity';

@Resolver(() => Meeting)
export class MeetingResolver {
  constructor(
    private readonly meetingService: MeetingService,
    private readonly workspaceService: WorkspaceService,
    private readonly userService: UserService,
    private readonly meetingGateway: MeetingGateway,
  ) {}

  @Mutation(() => Meeting)
  @UseGuards(AuthGuard)
  async createMeeting(
    @Args('title') title: string,
    @Args('startTime') startTime: Date,
    @Args('workspaceId', { type: () => ID }) workspaceId: string,
    @Args('description', { nullable: true }) description: string,
    @CurrentUser() user: any,
  ) {
    return this.meetingService.create({
      title,
      startTime,
      workspaceId,
      description,
      hostId: user._id || user.id,
    });
  }

  @Query(() => [Meeting], { name: 'getWorkspaceMeetings' })
  @UseGuards(AuthGuard)
  async getWorkspaceMeetings(
    @Args('workspaceId', { type: () => ID }) workspaceId: string,
  ) {
    return this.meetingService.findByWorkspace(workspaceId);
  }

  @ResolveField(() => Workspace, { nullable: true })
  async workspace(@Parent() meeting: Meeting) {
    try {
      return await this.workspaceService.findById(
        meeting.workspaceId.toString(),
      );
    } catch {
      return null;
    }
  }

  @ResolveField(() => User, { nullable: true })
  async host(@Parent() meeting: Meeting) {
    try {
      return await this.userService.findById(meeting.hostId.toString());
    } catch {
      return null;
    }
  }

  @Mutation(() => Meeting)
  @UseGuards(AuthGuard)
  async updateMeetingStatus(
    @Args('id', { type: () => ID }) id: string,
    @Args('status', { type: () => MeetingStatus }) status: MeetingStatus,
  ) {
    const meeting = await this.meetingService.updateStatus(id, status);
    if (status === MeetingStatus.ENDED) {
      this.meetingGateway.broadcastMeetingEnded(id);
    }
    return meeting;
  }
}
