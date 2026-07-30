import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
  ID,
} from '@nestjs/graphql';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserService } from './users.service';
import { CreateUserInput } from '../auth/dto/create-user.dto';
import { FindUsersWithPaginationInput } from './dto/find-user-pagination-input.dto';
import { UpdateUserInput } from './dto/update-user.dto';
import { UserPaginationResponse } from './dto/user-pagination.dto';
import { UserResponse } from './dto/user-response-dto';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { User } from './entities/user.entity';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { UseGuards } from '@nestjs/common';

@Resolver(() => User)
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  @ResolveField(() => User, { nullable: true })
  async creator(@Parent() user: User) {
    if (!user.createdBy) return null;
    try {
      return await this.userService.findById(user.createdBy.toString());
    } catch {
      return null; // Don't throw if creator is not found, just return null for safety
    }
  }

  @UseGuards(AuthGuard)
  @Query(() => UserResponse)
  async me(@CurrentUser() user: User) {
    return {
      code: 200,
      success: true,
      message: 'myself fetched successfully',
      user,
    };
  }

  @Mutation(() => UserResponse)
  async createUser(
    @Args('input') input: CreateUserInput,
  ): Promise<UserResponse> {
    const user = await this.userService.create(input);
    return {
      code: 201,
      message: 'User created successfully',
      success: true,
      user,
    };
  }

  @Mutation(() => UserResponse)
  async updateUser(
    @Args('input') input: UpdateUserInput,
  ): Promise<UserResponse> {
    const user = await this.userService.updateUser(input);
    return {
      code: 200,
      message: 'User updated successfully',
      success: true,
      user,
    };
  }

  @Mutation(() => UserResponse, { name: 'verifyEmailManual' })
  @UseGuards(AuthGuard)
  async verifyEmailManual(@CurrentUser() user: User): Promise<UserResponse> {
    const verifiedUser = await this.userService.verifyEmail(user);
    return {
      code: 200,
      message: 'Email verified successfully',
      success: true,
      user: verifiedUser,
    };
  }

  @Query(() => UserPaginationResponse)
  async findUserWithPagination(
    @Args('input') input: FindUsersWithPaginationInput,
  ): Promise<UserPaginationResponse> {
    const result = await this.userService.findUsersWithPagination(input);

    return {
      code: 200,
      message: 'Users fetched successfully',
      success: true,
      ...result,
    };
  }
}
