import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class UpdateWorkspaceConfigInput {
     @Field(() => Boolean, { nullable: true, description: "set as default inherit from user who owned it. other inputs are ignored.." })
     setDefaultInherit?: boolean;

     @Field(() => Boolean, { nullable: true, description: 'Is Chat enabled for this workspace' })
     isChatEnabled?: boolean;

     @Field(() => Number, { nullable: true, description: 'Maximum number of members allowed in the workspace' })
     maxMembers?: number | null;

     @Field(() => Number, { nullable: true, description: 'Maximum number of projects allowed in the workspace' })
     maxProjects?: number | null;

     @Field(() => Number, { nullable: true, description: 'Maximum users per project allowed in the workspace' })
     maxUsersPerProject?: number | null;

     @Field(() => String, { description: "Configuration note or details" })
     configNote: string;

}