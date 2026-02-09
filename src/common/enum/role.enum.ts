import { registerEnumType } from "@nestjs/graphql";

export enum ROLE {
     USER = 'user',
     ADMIN = 'admin'
}

registerEnumType(ROLE, {
     name: "Role",
     description: "describe the top level role of user with in the system"
})