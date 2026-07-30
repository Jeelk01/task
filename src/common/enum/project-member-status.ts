import { registerEnumType } from '@nestjs/graphql';

export enum ProjectMemberStatus {
  INVITED = 'invited',
  ACTIVE = 'active',
  REMOVED = 'removed',
  REJECTED = 'rejected',
}

registerEnumType(ProjectMemberStatus, {
  name: 'ProjectMemberStatus',
  description: 'project member status',
});
