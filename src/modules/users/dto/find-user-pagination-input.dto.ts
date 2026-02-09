import { Field, InputType } from "@nestjs/graphql";
import { ROLE } from "src/common/enum/role.enum";
import { PaginationInput } from "src/common/pagination/pagination-input";

@InputType()
export class FindUsersWithPaginationInput extends PaginationInput {
     @Field(() => String, { nullable: true, description: "General search over the document" })
     search?: string

     @Field(() => String, { nullable: true, description: 'search name' })
     name?: string

     @Field(() => ROLE, { nullable: true, description: 'Role of user' })
     role?: string

     @Field(() => String, { nullable: true, description: 'Search email' })
     email?: string

     @Field(() => Boolean, { nullable: true, description: 'User by verification' })
     isVerified?: boolean

     @Field(() => Boolean, { nullable: true, description: 'User is active or not' })
     isActive?: boolean

}