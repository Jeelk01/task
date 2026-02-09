import { Field, ID, InputType } from "@nestjs/graphql"
import GraphQLJSON from "graphql-type-json"

@InputType()
export class CreateWorkspaceInput {
     @Field(() => ID, { description: "User who is creating the workspace" })
     ownerId: string

     @Field(() => ID, { description: "Subscription plan which is going to apply for workspace", nullable: true })
     subscriptionId: string

     @Field(() => String, { description: "Workspace title" })
     title: string

     @Field(() => String, { description: "Description for the workspace" })
     description: string

     @Field(() => GraphQLJSON, { description: 'key-value pair meta for the workspace', nullable: true })
     meta: Object

     @Field(() => [String], { description: 'Tags for the workspace', nullable: true })
     tags: string[]
     
}