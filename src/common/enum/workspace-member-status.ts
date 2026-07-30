import { registerEnumType } from '@nestjs/graphql';

export enum WorkspaceMemberStatus {
  INVITED = 'invited',
  ACTIVE = 'active',
  REMOVED = 'removed',
  REJECTED = 'rejected',
}

registerEnumType(WorkspaceMemberStatus, {
  name: 'WorkspaceMemberStatus',
  description: 'workspace member status',
});
