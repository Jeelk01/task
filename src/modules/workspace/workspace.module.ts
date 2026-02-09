import { Module } from "@nestjs/common";
import { WorkspaceService } from "./workspace.service";
import { WorkspaceResolver } from "./workspace.resolver";
import { MongooseModule } from "@nestjs/mongoose";
import { Workspace, WorkspaceSchema } from "./entities/workspace.entity";
import { WorkspaceMember, WorkspaceMemberSchema } from "./entities/workspace-member.entity";
import { WorkspaceConfig, WorkspaceConfigSchema } from "./entities/worksapce-config.entity";

@Module({
     imports: [MongooseModule.forFeature([
          { name: Workspace.name, schema: WorkspaceSchema },
          { name: WorkspaceMember.name, schema: WorkspaceMemberSchema },
          { name: WorkspaceConfig.name, schema: WorkspaceConfigSchema }
     ])],
     providers: [WorkspaceService, WorkspaceResolver],
     exports: [WorkspaceService],
})
export class WorkspaceModule { }