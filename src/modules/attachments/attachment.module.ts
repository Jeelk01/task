import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AttachmentService } from './attachment.service';
import { AttachmentResolver } from './attachment.resolver';
import { Attachment, AttachmentSchema } from './entity/attachment.entity';
import {
  WorkspaceMember,
  WorkspaceMemberSchema,
} from 'src/modules/workspace/entities/workspace-member.entity';
import { WorkspaceModule } from '../workspace/workspace.module';
import { ProjectModule } from '../project/project.module';
import { TaskModule } from '../task/task.module';
import { UploadModule } from '../upload/upload.module';
import { UserModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Attachment.name, schema: AttachmentSchema },
      { name: WorkspaceMember.name, schema: WorkspaceMemberSchema },
    ]),
    WorkspaceModule,
    ProjectModule,
    TaskModule,
    UploadModule,
    UserModule,
  ],
  providers: [AttachmentService, AttachmentResolver],
  exports: [AttachmentService],
})
export class AttachmentModule {}
