import { registerEnumType } from "@nestjs/graphql";

export enum WorkspaceRole {
     OWNER = 'owner',
     VIEWER = 'viewer',
     ADMIN = 'admin',
     MEMBER = 'member',
}

registerEnumType(WorkspaceRole, {
     name: 'WorkspaceRole',
     description: 'describe the role for the user in the workspace.'
})

