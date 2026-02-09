import { Field, ObjectType } from "@nestjs/graphql";
import { BaseResponse } from "src/common/helper/response/base.response";
import { User } from "src/modules/users/entities/user.entity";

@ObjectType()
export class AuthResponse extends BaseResponse {
     @Field(() => String, { description: 'access token that should be send with each api call.' })
     accessToken: string;

     @Field(() => String, { description: 'refresh token for updating access token' })
     refreshToken: string;

     @Field(() => User, { nullable: true, description: 'User document' })
     user?: User
}