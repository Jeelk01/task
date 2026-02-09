import { ObjectType } from "@nestjs/graphql";
import { Field } from "@nestjs/graphql";
import { Membership } from "../entities/membership.entity";
import { BaseResponse } from "src/common/helper/response/base.response";

@ObjectType()
export class MembershipResponse extends BaseResponse {
     @Field(() => Membership)
     membership: Membership;
}
