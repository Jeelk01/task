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
import { TaskService } from './task.service';
import { Task } from './entity/task.entity';
import { CreateTaskInput, UpdateTaskInput } from './dto/create-task.dto';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { User } from 'src/modules/users/entities/user.entity';
import { FindTasksArgs } from './dto/find-tasks.args';
import { TaskPaginationResponse } from './dto/task-pagination-response.dto';
import { Workspace } from 'src/modules/workspace/entities/workspace.entity';
import { Project } from 'src/modules/project/entities/project.entity';
import { WorkspaceService } from 'src/modules/workspace/workspace.service';
import { ProjectService } from 'src/modules/project/project.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Attachment } from '../attachments/entity/attachment.entity';

@Resolver(() => Task)
export class TaskResolver {
  constructor(
    private readonly taskService: TaskService,
    private readonly workspaceService: WorkspaceService,
    private readonly projectService: ProjectService,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Task.name) private taskModel: Model<Task>,
    @InjectModel(Attachment.name) private attachmentModel: Model<Attachment>,
  ) {}

  @ResolveField(() => Workspace)
  async workspace(@Parent() task: Task) {
    return await this.workspaceService.findById(task.workspaceId.toString());
  }

  @ResolveField(() => Project)
  async project(@Parent() task: Task) {
    // Assuming projectService has a findById method or equivalent
    // Let's check projectService first or implementation findById here if needed.
    // For now, I'll assume it exists or use model directly if I have to.
    return await this.projectService.findById(task.projectId.toString());
  }

  @ResolveField(() => User)
  async assigner(@Parent() task: Task) {
    return await this.userModel.findById(task.assignedBy);
  }

  @ResolveField(() => [User])
  async assignees(@Parent() task: Task) {
    return await this.userModel.find({ _id: { $in: task.assignedTo } });
  }

  @ResolveField(() => [Attachment])
  async attachmentsList(@Parent() task: Task) {
    return await this.attachmentModel.find({ _id: { $in: task.attachments } });
  }

  @ResolveField(() => Task, { nullable: true })
  async blockerTask(@Parent() task: Task) {
    if (!task.blockerId) return null;
    return await this.taskModel.findById(task.blockerId);
  }

  @Mutation(() => Task)
  @UseGuards(AuthGuard)
  async createTask(
    @CurrentUser() user: User,
    @Args('input') input: CreateTaskInput,
  ) {
    return await this.taskService.createTask(user, input);
  }

  @Mutation(() => Task)
  @UseGuards(AuthGuard)
  async updateTask(
    @CurrentUser() user: User,
    @Args('input') input: UpdateTaskInput,
  ) {
    return await this.taskService.updateTask(user, input);
  }

  @Mutation(() => Task)
  @UseGuards(AuthGuard)
  async deleteTask(@CurrentUser() user: User, @Args('id') id: string) {
    return await this.taskService.deleteTask(id, user);
  }

  @Query(() => TaskPaginationResponse)
  @UseGuards(AuthGuard)
  async findTasks(
    @CurrentUser() user: User,
    @Args('args') args: FindTasksArgs,
  ) {
    return await this.taskService.findTasks(args, user);
  }

  @Query(() => TaskPaginationResponse)
  @UseGuards(AuthGuard)
  async findMyTasks(
    @CurrentUser() user: User,
    @Args('args') args: FindTasksArgs,
  ) {
    return await this.taskService.findMyTasks(args, user);
  }

  @Query(() => Task)
  @UseGuards(AuthGuard)
  async findTaskById(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
  ) {
    return await this.taskService.findById(id, user);
  }
}
