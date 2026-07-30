import { registerEnumType } from '@nestjs/graphql';

export enum ProjectRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MANAGER = 'manager',
  MEMBER = 'member',
  VIEWER = 'viewer',
}

registerEnumType(ProjectRole, {
  name: 'ProjectRole',
  description: 'Describe the role of user for project.',
});
