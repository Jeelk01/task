import {
  Resolver,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AttachmentService } from './attachment.service';
import { Attachment } from './entity/attachment.entity';
import { CreateAttachmentInput } from './dto/create-attachment.dto';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { User } from 'src/modules/users/entities/user.entity';
import { Workspace } from 'src/modules/workspace/entities/workspace.entity';
import { Project } from 'src/modules/project/entities/project.entity';
import { Task } from 'src/modules/task/entity/task.entity';
import { WorkspaceService } from 'src/modules/workspace/workspace.service';
import { ProjectService } from 'src/modules/project/project.service';
import { TaskService } from 'src/modules/task/task.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Resolver(() => Attachment)
export class AttachmentResolver {
  constructor(
    private readonly attachmentService: AttachmentService,
    private readonly workspaceService: WorkspaceService,
    private readonly projectService: ProjectService,
    private readonly taskService: TaskService,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  @ResolveField(() => Workspace)
  async workspace(@Parent() attachment: Attachment) {
    return await this.workspaceService.findById(
      attachment.workspaceId.toString(),
    );
  }

  @ResolveField(() => Project, { nullable: true })
  async project(@Parent() attachment: Attachment) {
    if (!attachment.projectId) return null;
    return await this.projectService.findById(attachment.projectId.toString());
  }

  @ResolveField(() => Task, { nullable: true })
  async task(@Parent() attachment: Attachment, @CurrentUser() user: User) {
    if (!attachment.taskId) return null;
    // Assuming taskService has findById; if not, use model or add it.
    // Let's check taskService first.
    return await this.taskService.findById(attachment.taskId.toString(), user);
  }

  @ResolveField(() => User)
  async uploader(@Parent() attachment: Attachment) {
    return await this.userModel.findById(attachment.uploadedBy);
  }

  @Mutation(() => Attachment)
  @UseGuards(AuthGuard)
  async uploadAttachment(
    @CurrentUser() user: User,
    @Args('input') input: CreateAttachmentInput,
  ) {
    return await this.attachmentService.uploadAttachment(user, input);
  }

  @Mutation(() => Attachment)
  @UseGuards(AuthGuard)
  async deleteAttachment(@CurrentUser() user: User, @Args('id') id: string) {
    return await this.attachmentService.deleteAttachment(id, user);
  }
}
