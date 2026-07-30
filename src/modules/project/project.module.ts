import { Module } from '@nestjs/common';
import { ProjectResolver, ProjectMemberResolver } from './project.resolver';
import { ProjectService } from './project.service';

import { MongooseModule } from '@nestjs/mongoose';
import { Project, ProjectSchema } from './entities/project.entity';
import {
  ProjectMember,
  ProjectMemberSchema,
} from './entities/project-member.entity';
import {
  WorkspaceMember,
  WorkspaceMemberSchema,
} from 'src/modules/workspace/entities/workspace-member.entity';
import { WorkspaceModule } from '../workspace/workspace.module';
import { UserModule } from '../users/users.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Project.name, schema: ProjectSchema },
      { name: ProjectMember.name, schema: ProjectMemberSchema },
      { name: WorkspaceMember.name, schema: WorkspaceMemberSchema },
    ]),
    WorkspaceModule,
    UserModule,
    NotificationModule,
  ],
  providers: [ProjectService, ProjectResolver, ProjectMemberResolver],
  exports: [ProjectService],
})
export class ProjectModule {}
