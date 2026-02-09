import { Field, InputType, Int } from "@nestjs/graphql";

@InputType()
export class PaginationInput {
     @Field(() => Int, { defaultValue: 1, description: 'Pagination input limit per page' })
     limit: number

     @Field(() => Int, { defaultValue: 10, description: 'Pagination input page number' })
     page: number

}