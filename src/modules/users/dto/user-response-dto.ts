import { Field, ObjectType } from "@nestjs/graphql";
import { BaseResponse } from "src/common/helper/response/base.response";
import { User } from "../entities/user.entity";

@ObjectType()
export class UserResponse extends BaseResponse {
     @Field(() => User, { nullable: true, description: 'User Document' })
     user?: User | null
}