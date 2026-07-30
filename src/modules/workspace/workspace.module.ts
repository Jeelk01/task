import { Module } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import {
  WorkspaceResolver,
  WorkspaceMemberResolver,
} from './workspace.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { Workspace, WorkspaceSchema } from './entities/workspace.entity';
import {
  WorkspaceMember,
  WorkspaceMemberSchema,
} from './entities/workspace-member.entity';
import {
  WorkspaceConfig,
  WorkspaceConfigSchema,
} from './entities/worksapce-config.entity';
import { UserModule } from '../users/users.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Workspace.name, schema: WorkspaceSchema },
      { name: WorkspaceMember.name, schema: WorkspaceMemberSchema },
      { name: WorkspaceConfig.name, schema: WorkspaceConfigSchema },
    ]),
    UserModule,
    NotificationModule,
  ],
  providers: [WorkspaceService, WorkspaceResolver, WorkspaceMemberResolver],
  exports: [WorkspaceService],
})
export class WorkspaceModule {}
