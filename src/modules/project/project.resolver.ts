import {
  Resolver,
  Mutation,
  Args,
  Query,
  ResolveField,
  Parent,
  ID,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectInput } from './dto/create-project.dto';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { User } from 'src/modules/users/entities/user.entity';
import { Project } from './entities/project.entity';
import { FindProjectsArgs } from './dto/find-projects.args';
import { ProjectPaginationResponse } from './dto/project-pagination-response.dto';
import { UpdateProjectInput } from './dto/update-project.dto';
import { Workspace } from 'src/modules/workspace/entities/workspace.entity';
import { WorkspaceService } from 'src/modules/workspace/workspace.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ProjectMember } from './entities/project-member.entity';
import { FindProjectMemberWithPagination } from './dto/find-project-member-pagination-input.dto';
import { ProjectMemberResponse } from './dto/project-member-response.dto';
import { ProjectRole } from 'src/common/enum/project-role.enum';

@Resolver(() => Project)
export class ProjectResolver {
  constructor(
    private readonly projectService: ProjectService,
    private readonly workspaceService: WorkspaceService,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  @ResolveField(() => User)
  async creator(@Parent() project: Project) {
    return await this.userModel.findById(project.creatorId);
  }

  @ResolveField(() => Workspace)
  async workspace(@Parent() project: Project) {
    return await this.workspaceService.findById(project.workspaceId.toString());
  }

  @ResolveField(() => [User])
  async memberUsers(@Parent() project: Project) {
    return await this.userModel.find({ _id: { $in: project.members } });
  }

  @ResolveField(() => String, { nullable: true })
  async myRole(@Parent() project: Project, @CurrentUser() user: User) {
    return await this.projectService.getMemberRole(
      project._id.toString(),
      user._id.toString(),
    );
  }

  @Mutation(() => Project)
  @UseGuards(AuthGuard)
  async createProject(
    @CurrentUser() user: User,
    @Args('input') input: CreateProjectInput,
  ) {
    return await this.projectService.createProject(user, input);
  }

  @Mutation(() => Project)
  @UseGuards(AuthGuard)
  async updateProject(
    @CurrentUser() user: User,
    @Args('id') id: string,
    @Args('input') input: UpdateProjectInput,
  ) {
    return await this.projectService.updateProject(id, user, input);
  }

  @Mutation(() => Project)
  @UseGuards(AuthGuard)
  async deleteProject(@CurrentUser() user: User, @Args('id') id: string) {
    return await this.projectService.deleteProject(id, user);
  }

  @Query(() => ProjectPaginationResponse)
  @UseGuards(AuthGuard)
  async findProjects(@Args('args') args: FindProjectsArgs) {
    return await this.projectService.findProjects(args);
  }

  @Query(() => ProjectPaginationResponse)
  @UseGuards(AuthGuard)
  async findMyProjects(
    @CurrentUser() user: User,
    @Args('args') args: FindProjectsArgs,
  ) {
    return await this.projectService.findMyProjects(args, user);
  }

  @Query(() => Project)
  @UseGuards(AuthGuard)
  async findProjectById(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
  ) {
    return await this.projectService.findById(id, user);
  }

  @Query(() => ProjectMemberResponse)
  @UseGuards(AuthGuard)
  async findProjectMemberWithPagination(
    @Args('input') input: FindProjectMemberWithPagination,
  ) {
    const result =
      await this.projectService.findProjectMemberWithPagination(input);
    return {
      ...result,
      code: 200,
      success: true,
      message: 'Project members fetched successfully',
    };
  }

  @Mutation(() => ProjectMember)
  @UseGuards(AuthGuard)
  async addProjectMember(
    @CurrentUser() user: User,
    @Args('projectId', { type: () => ID }) projectId: string,
    @Args('email') email: string,
    @Args('role', { type: () => ProjectRole }) role: ProjectRole,
  ) {
    return await this.projectService.addProjectMember(
      projectId,
      email,
      role,
      user,
    );
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  async removeProjectMember(
    @CurrentUser() user: User,
    @Args('projectId', { type: () => ID }) projectId: string,
    @Args('memberId', { type: () => ID }) memberId: string,
  ) {
    return await this.projectService.removeProjectMember(
      projectId,
      memberId,
      user,
    );
  }

  @Mutation(() => ProjectMember)
  @UseGuards(AuthGuard)
  async updateProjectMemberRole(
    @CurrentUser() user: User,
    @Args('projectId', { type: () => ID }) projectId: string,
    @Args('memberId', { type: () => ID }) memberId: string,
    @Args('role', { type: () => ProjectRole }) role: ProjectRole,
  ) {
    return await this.projectService.updateProjectMemberRole(
      projectId,
      memberId,
      role,
      user,
    );
  }

  @Mutation(() => ProjectMember)
  @UseGuards(AuthGuard)
  async acceptProjectInvitation(
    @CurrentUser() user: User,
    @Args('projectId', { type: () => ID }) projectId: string,
  ) {
    return await this.projectService.acceptProjectInvitation(projectId, user);
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  async rejectProjectInvitation(
    @CurrentUser() user: User,
    @Args('projectId', { type: () => ID }) projectId: string,
  ) {
    return await this.projectService.rejectProjectInvitation(projectId, user);
  }
}

@Resolver(() => ProjectMember)
export class ProjectMemberResolver {
  constructor(
    private readonly projectService: ProjectService,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  @ResolveField(() => Project)
  async project(@Parent() member: ProjectMember) {
    if (member.project) return member.project;
    return this.projectService.findById(member.projectId.toString());
  }

  @ResolveField(() => User, { nullable: true })
  async user(@Parent() member: ProjectMember) {
    if (!member.userId) return null;
    return await this.userModel.findById(member.userId);
  }

  @ResolveField(() => User, { name: 'invitedBy', nullable: true })
  async invitedByUser(@Parent() member: ProjectMember) {
    return await this.userModel.findById(member.invitedBy);
  }
}
