import { Args, ID, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { MemberShipService } from "./membership.service";
import { FindMembership } from "./dto/find-membership-input.dto";
import { MembershipPagination } from "./dto/membership-pagination.dto";
import { CreateMembershipInput } from "./dto/create-membership.dto";
import { UpdateMembershipInput } from "./dto/update-membership.dto";
import { UpdateMembershipResponse } from "./dto/update-membership-response.dto";
import { Membership } from "./entities/membership.entity";
import { BaseResponse } from "src/common/helper/response/base.response";
import { User } from "../users/entities/user.entity";
import { UserService } from "../users/users.service";
import { Types } from "mongoose";

@Resolver(() => Membership)
export class MembershipResolver {

     constructor(
          private readonly membershipService: MemberShipService,
          private readonly userService: UserService,
     ) { }

     @ResolveField(() => User, { name: 'creator' })
     async getCreator(@Parent() plan: Membership) {
          return this.userService.findById(plan.createdBy.toString())
     }


     @Query(() => MembershipPagination)
     async findMemberships(
          @Args("input") input: FindMembership
     ) {
          const result = await this.membershipService.findMembershipWithPagination(input);

          return {
               ...result,
               code: 200,
               success: true,
               message: "OK"
          };
     }

     // RequiredRole - Admin
     // @Mutation(() => CreateMembershipResponse)
     // async createMembership(
     //      @Args("input") input: CreateMembershipInput
     // ) {

     //      // later we have to pass the creator of plan in ( userId )
     //      const membership = await this.membershipService.createMembership({ ...input, createdBy: new Types.ObjectId('695b5046b11369f9cea4ee2f') });

     //      return {
     //           code: 201,
     //           success: true,
     //           message: "Membership plan created successfully.",
     //           membership
     //      };
     // }

     // RequiredRole - Admin
     @Mutation(() => UpdateMembershipResponse)
     async updateMembership(
          @Args("input") input: UpdateMembershipInput
     ) {
          const membership = await this.membershipService.updateMembership({
               ...input,
               _id: new Types.ObjectId(input._id)
          });

          return {
               code: 200,
               success: true,
               message: "Membership plan updated successfully.",
               membership
          };
     }


}
