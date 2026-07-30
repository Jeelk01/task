import {
  Query,
  Mutation,
  Args,
  Resolver,
  ResolveField,
  Parent,
  ID,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { WorkspacePaginationResponse } from './dto/workspace-pagination-response.dto';
import { FindWorkspaceWithPagination } from './dto/find-workspace.dto';
import { CreateWorkspaceInput } from './dto/create-workspace.dto';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { User } from 'src/modules/users/entities/user.entity';
import { Workspace } from './entities/workspace.entity';
import { Model, Types } from 'mongoose';
import { WorkspaceMember } from './entities/workspace-member.entity';
import { FindWorkspaceMemberWithPagination } from './dto/find-workspace-member-pagination-input.dto';
import { WorkspaceMemberResponse } from './dto/workspace-member-resposne.dto';
import { WorkspaceRole } from 'src/common/enum/workspace-role.enum';
import { BaseResponse } from 'src/common/helper/response/base.response';
import { WorkspaceMemberStatus } from 'src/common/enum/workspace-member-status';
import { FindWorkspacesArgs } from './dto/find-workspaces.args';
import { InjectModel } from '@nestjs/mongoose';

@Resolver(() => Workspace)
export class WorkspaceResolver {
  constructor(
    private readonly workspaceService: WorkspaceService,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  @ResolveField(() => User)
  async owner(@Parent() workspace: Workspace) {
    return await this.userModel.findById(workspace.ownerId);
  }

  async memberUsers(@Parent() workspace: Workspace) {
    return await this.userModel.find({ _id: { $in: workspace.members } });
  }

  @ResolveField(() => String, { nullable: true })
  async myRole(@Parent() workspace: Workspace, @CurrentUser() user: User) {
    return await this.workspaceService.getMemberRole(
      workspace._id.toString(),
      user._id.toString(),
    );
  }

  @Query(() => WorkspacePaginationResponse)
  @UseGuards(AuthGuard)
  async findWorkspaceWithPagination(
    @Args('input') input: FindWorkspaceWithPagination,
  ) {
    const { items, totalItems, totalPages, page, limit } =
      await this.workspaceService.findWithPagination(input);
    return {
      items,
      totalItems,
      totalPages,
      page,
      limit,
      code: 200,
      message: 'Workspaces fetched successfully',
      success: true,
    };
  }

  @Mutation(() => Workspace)
  @UseGuards(AuthGuard)
  async createWorkspace(
    @CurrentUser() user: User,
    @Args('input') input: CreateWorkspaceInput,
  ) {
    return await this.workspaceService.createWorkspace(user, input);
  }

  @Mutation(() => Workspace)
  @UseGuards(AuthGuard)
  async updateWorkspace(
    @CurrentUser() user: User,
    @Args('id') id: string,
    @Args('input') input: CreateWorkspaceInput,
  ) {
    return await this.workspaceService.updateWorkspace(id, user, input);
  }

  @Mutation(() => Workspace)
  @UseGuards(AuthGuard)
  async deleteWorkspace(@CurrentUser() user: User, @Args('id') id: string) {
    return await this.workspaceService.deleteWorkspace(id, user);
  }

  @Query(() => Workspace)
  @UseGuards(AuthGuard)
  async findWorkspaceById(@Args('id', { type: () => ID }) id: string) {
    return await this.workspaceService.findById(id);
  }

  @Query(() => WorkspacePaginationResponse)
  @UseGuards(AuthGuard)
  async findWorkspaces(@Args('args') args: FindWorkspacesArgs) {
    const response = await this.workspaceService.findWorkspaces(args);
    return response;
  }

  @Query(() => WorkspacePaginationResponse)
  @UseGuards(AuthGuard)
  async findMyWorkspaces(
    @CurrentUser() user: User,
    @Args('args') args: FindWorkspacesArgs,
  ) {
    const response = await this.workspaceService.findMyWorkspaces(args, user);
    return response;
  }

  @Query(() => WorkspaceMemberResponse)
  @UseGuards(AuthGuard)
  async findWorkspaceMemberWithPagination(
    @Args('input') input: FindWorkspaceMemberWithPagination,
  ) {
    const result =
      await this.workspaceService.findWorkspaceMemberWithPagination(input);
    return {
      ...result,
      code: 200,
      success: true,
      message: 'Workspaces fetched successfully',
    } as any;
  }

  @Query(() => [WorkspaceMember], { name: 'findMyInvitations' })
  @UseGuards(AuthGuard)
  async findMyInvitations(@CurrentUser() user: User) {
    return this.workspaceService.findMyInvitations(user);
  }

  @Mutation(() => WorkspaceMember, { name: 'acceptWorkspaceInvitation' })
  @UseGuards(AuthGuard)
  async acceptWorkspaceInvitation(
    @Args('invitationId', { type: () => ID }) invitationId: string,
    @CurrentUser() user: User,
  ) {
    return this.workspaceService.acceptInvitation(invitationId, user);
  }

  @Mutation(() => Boolean, { name: 'rejectWorkspaceInvitation' })
  @UseGuards(AuthGuard)
  async rejectWorkspaceInvitation(
    @Args('invitationId', { type: () => ID }) invitationId: string,
    @CurrentUser() user: User,
  ) {
    return this.workspaceService.rejectInvitation(invitationId, user);
  }

  @Mutation(() => WorkspaceMember)
  @UseGuards(AuthGuard)
  async addWorkspaceMember(
    @CurrentUser() user: User,
    @Args('workspaceId', { type: () => ID }) workspaceId: string,
    @Args('email') email: string,
    @Args('role', { type: () => WorkspaceRole }) role: WorkspaceRole,
  ) {
    return await this.workspaceService.addWorkspaceMember(
      workspaceId,
      email,
      role,
      user,
    );
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  async removeWorkspaceMember(
    @CurrentUser() user: User,
    @Args('workspaceId', { type: () => ID }) workspaceId: string,
    @Args('memberId', { type: () => ID }) memberId: string,
  ) {
    return await this.workspaceService.removeWorkspaceMember(
      workspaceId,
      memberId,
      user,
    );
  }

  @Mutation(() => WorkspaceMember)
  @UseGuards(AuthGuard)
  async updateWorkspaceMemberRole(
    @CurrentUser() user: User,
    @Args('workspaceId', { type: () => ID }) workspaceId: string,
    @Args('memberId', { type: () => ID }) memberId: string,
    @Args('role', { type: () => WorkspaceRole }) role: WorkspaceRole,
  ) {
    return await this.workspaceService.updateWorkspaceMemberRole(
      workspaceId,
      memberId,
      role,
      user,
    );
  }
}

@Resolver(() => WorkspaceMember)
export class WorkspaceMemberResolver {
  constructor(
    private readonly workspaceService: WorkspaceService,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  @ResolveField(() => Workspace)
  async workspace(@Parent() member: WorkspaceMember) {
    if (member.workspace) return member.workspace;
    return this.workspaceService.findById(member.workspaceId.toString());
  }

  @ResolveField(() => User, { nullable: true })
  async user(@Parent() member: WorkspaceMember) {
    if (!member.userId) return null;
    return await this.userModel.findById(member.userId);
  }

  @ResolveField(() => User, { name: 'invitedBy', nullable: true })
  async invitedByUser(@Parent() member: WorkspaceMember) {
    return await this.userModel.findById(member.invitedBy);
  }

  @ResolveField(() => User, { nullable: true })
  async removedByUser(@Parent() member: WorkspaceMember) {
    if (!member.removedBy) return null;
    return await this.userModel.findById(member.removedBy);
  }
}
