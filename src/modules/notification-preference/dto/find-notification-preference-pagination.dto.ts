import { Field, ID, InputType } from "@nestjs/graphql";
import { PaginatedResponse } from "src/common/pagination/paginated-response.factory";
import { PaginationInput } from "src/common/pagination/pagination-input";


@InputType()
export class FindNotificationPreferenceInput extends PaginationInput {
     @Field(() => ID, { nullable: true, description: '' })
     _id?: string;

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

     @Field(() => ID, { nullable: true, description: `userid for which we're finding preferences` })
     userId?: string;
}