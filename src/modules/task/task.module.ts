import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TaskService } from './task.service';
import { TaskResolver } from './task.resolver';
import { Task, TaskSchema } from './entity/task.entity';
import {
  Project,
  ProjectSchema,
} from 'src/modules/project/entities/project.entity';
import {
  ProjectMember,
  ProjectMemberSchema,
} from 'src/modules/project/entities/project-member.entity';
import {
  WorkspaceMember,
  WorkspaceMemberSchema,
} from 'src/modules/workspace/entities/workspace-member.entity';
import {
  Attachment,
  AttachmentSchema,
} from '../attachments/entity/attachment.entity';

import { MailModule } from 'src/modules/email/email.module';
import { NotificationPreferenceModule } from 'src/modules/notification-preference/notification-preference.module';
import { WorkspaceModule } from '../workspace/workspace.module';
import { ProjectModule } from '../project/project.module';
import { UserModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Task.name, schema: TaskSchema },
      { name: Project.name, schema: ProjectSchema },
      { name: ProjectMember.name, schema: ProjectMemberSchema },
      { name: WorkspaceMember.name, schema: WorkspaceMemberSchema },
      { name: Attachment.name, schema: AttachmentSchema },
    ]),
    MailModule,
    NotificationPreferenceModule,
    WorkspaceModule,
    ProjectModule,
    UserModule,
  ],
  providers: [TaskService, TaskResolver],
  exports: [TaskService],
})
export class TaskModule {}
