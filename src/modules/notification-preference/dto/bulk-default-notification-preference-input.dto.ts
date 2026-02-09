import { Field, ID, InputType } from "@nestjs/graphql";

@InputType()
export class BulkCreateNotificationPrefInput {
     @Field(() => [ID])
     userIds: string[];
}
