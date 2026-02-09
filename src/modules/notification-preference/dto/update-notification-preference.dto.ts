import { Field, ID, InputType } from "@nestjs/graphql";


@InputType()
export class UpdateNotificationPreferenceInput {
     @Field(() => ID, { description: "User id of user for which notification preference is updated" })
     userId: string

     @Field(() => Boolean, { nullable: true, description: 'workspace invites mails' })
     workspaceInvites?: boolean;

     @Field(() => Boolean, { nullable: true, description: 'project invites mails' })
     projectInvites?: boolean;

     @Field(() => Boolean, { nullable: true, description: 'security alerts mail' })
     securityAlerts?: boolean;

     @Field(() => Boolean, { nullable: true, description: 'task assigned mails' })
     taskAssign?: boolean;

     @Field(() => Boolean, { nullable: true, description: 'meeting invites mails' })
     meetingInvites?: boolean;

     @Field(() => Boolean, { nullable: true, description: 'announcements mails' })
     announcement?: boolean;

     @Field(() => Boolean, { nullable: true, description: 'promotional mails' })
     promotional?: boolean;
}
