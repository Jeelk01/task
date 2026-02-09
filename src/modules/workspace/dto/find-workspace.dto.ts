import { Field, ID, InputType } from "@nestjs/graphql";
import { PaginationInput } from "src/common/pagination/pagination-input";

@InputType()
export class FindWorkspaceWithPagination extends PaginationInput {
     @Field(() => ID, { nullable: true, description: 'Workspace Id ' })
     workspaceId?: string;

     @Field(() => ID, { nullable: true, description: 'Owner Id' })
     ownerId?: string;

     @Field(() => String, { nullable: true, description: 'general search term for workspace name, description, tags, meta' })
     search?: string;

     @Field(() => Boolean, { nullable: true, description: 'isActive status of workspace' })
     isActive?: boolean;

     @Field(() => ID, { nullable: true, description: 'Member user id to filter workspaces in which user is member' })
     memberId?: string;

}