import { Field, ID, Int, ObjectType } from "@nestjs/graphql";
import { Type } from "@nestjs/common";
import { retry } from "rxjs";
import { BaseResponse } from "../helper/response/base.response";

export function PaginatedResponse<TItem>(TItemClass: Type<TItem>) {
     @ObjectType({ isAbstract: true })
     abstract class PaginateResponseClass extends BaseResponse {
          @Field(() => [TItemClass])
          items: TItem[]

          @Field(() => Int)
          page: number

          @Field(() => Int)
          limit: number

          @Field(() => Int)
          totalItems: number

          @Field(() => Int)
          totalPages: number
     }

     return PaginateResponseClass
}