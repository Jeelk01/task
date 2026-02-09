import { Field, InputType, ID } from "@nestjs/graphql";

@InputType()
export class CreateDefaultSubscriptionsInput {
     @Field(() => [ID])
     userIds: string[];
}
