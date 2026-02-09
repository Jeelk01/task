import { registerEnumType } from "@nestjs/graphql";

export enum PROJECT_ROLE {
     MANAGER = 'manager',
     VIEWER = 'viewer',
     ASSIGNEE = 'assign'
}

registerEnumType(PROJECT_ROLE, {
     name: 'PROJECT_ROLE',
     description: 'Describe the role of user for project.'
})