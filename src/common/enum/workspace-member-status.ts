import { registerEnumType } from "@nestjs/graphql";

export enum WorkspaceMemberStatus {
     INVITED = "invited",
     ACTIVE = "active",
     REMOVED = "removed",
     REJECTED = "rejected"
}

registerEnumType(WorkspaceMemberStatus, {
     name: 'WORKSPACE_MEMBER_STATUS',
     description: 'workspace member status'
})