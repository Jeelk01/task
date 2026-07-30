import {
  Args,
  ID,
  Mutation,
  Parent,
  Query,
  Resolver,
  ResolveField,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { MemberShipService } from './membership.service';
import { FindMembership } from './dto/find-membership-input.dto';
import { MembershipPagination } from './dto/membership-pagination.dto';
import { CreateMembershipInput } from './dto/create-membership.dto';
import { UpdateMembershipInput } from './dto/update-membership.dto';
import { UpdateMembershipResponse } from './dto/update-membership-response.dto';
import { Membership } from './entities/membership.entity';
import { BaseResponse } from 'src/common/helper/response/base.response';
import { User } from '../users/entities/user.entity';
import { UserService } from '../users/users.service';
import { Types } from 'mongoose';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { Roles } from 'src/common/decorator/roles.decorator';
import { ROLE } from 'src/common/enum/role.enum';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';

@Resolver(() => Membership)
export class MembershipResolver {
  constructor(
    private readonly membershipService: MemberShipService,
    private readonly userService: UserService,
  ) {}

  @ResolveField(() => User, { name: 'creator', nullable: true })
  async getCreator(@Parent() plan: Membership) {
    if (!plan.createdBy) return null;
    try {
      return await this.userService.findById(plan.createdBy.toString());
    } catch {
      return null;
    }
  }

  @Query(() => MembershipPagination)
  async findMemberships(@Args('input') input: FindMembership) {
    const result =
      await this.membershipService.findMembershipWithPagination(input);

    return {
      ...result,
      code: 200,
      success: true,
      message: 'OK',
    };
  }

  // RequiredRole - Admin
  // RequiredRole - Admin
  @Mutation(() => UpdateMembershipResponse)
  @Roles(ROLE.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  async createMembership(
    @CurrentUser() user: User,
    @Args('input') input: CreateMembershipInput,
  ) {
    const membership = await this.membershipService.createMembership({
      ...input,
      createdBy: user._id,
    });

    return {
      code: 201,
      success: true,
      message: 'Membership plan created successfully.',
      membership,
    };
  }

  // RequiredRole - Admin
  @Mutation(() => UpdateMembershipResponse)
  @Roles(ROLE.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  async updateMembership(@Args('input') input: UpdateMembershipInput) {
    const membership = await this.membershipService.updateMembership({
      ...input,
      _id: new Types.ObjectId(input._id),
    });

    return {
      code: 200,
      success: true,
      message: 'Membership plan updated successfully.',
      membership,
    };
  }

  @Mutation(() => BaseResponse)
  @Roles(ROLE.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  async deleteMembership(@Args('id', { type: () => ID }) id: string) {
    await this.membershipService.deleteMembership(id);
    return {
      code: 200,
      success: true,
      message: 'Membership plan deleted successfully.',
    };
  }
}
