import { registerEnumType } from '@nestjs/graphql';

export enum WorkspaceRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MANAGER = 'manager',
  MEMBER = 'member',
  VIEWER = 'viewer',
}

registerEnumType(WorkspaceRole, {
  name: 'WorkspaceRole',
  description: 'describe the role for the user in the workspace.',
});
