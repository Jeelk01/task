import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { NotificationPreferenceService } from './notification-preference.service';
import { NotificationPreferencePaginationResponse } from './dto/notification-preference-pagination.dto';
import { FindNotificationPreferenceInput } from './dto/find-notification-preference-pagination.dto';
import { User } from '../users/entities/user.entity';
import { NotificationPreference } from './entities/Notification-preference.entity';
import { UserService } from '../users/users.service';
import { NotificationPreferenceResponse } from './dto/notification-preference-response.dto';
import { UpdateNotificationPreferenceInput } from './dto/update-notification-preference.dto';
import { BulkNotificationPrefResponse } from './dto/bult-notification-preference-response.dto';
import { BulkCreateNotificationPrefInput } from './dto/bulk-default-notification-preference-input.dto';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { Types } from 'mongoose';

@Resolver(() => NotificationPreference)
export class NotificationPreferenceResolver {
  constructor(
    private readonly notificationPreferenceService: NotificationPreferenceService,
    private readonly userService: UserService,
  ) {}

  @ResolveField(() => User, { name: 'user', nullable: true })
  async getUser(@Parent() pref: NotificationPreference) {
    try {
      return await this.userService.findById(pref.userId.toString());
    } catch {
      return null;
    }
  }

  @UseGuards(AuthGuard)
  @Query(() => NotificationPreferenceResponse)
  async myNotificationPreference(@CurrentUser() user: User) {
    try {
      console.log('User Id in MyNotification Prefeence: ', user);

      const prefs = await this.notificationPreferenceService.get(
        user._id.toString(),
      );

      return {
        notificationPreference: prefs,
        code: 200,
        message: 'Notification Preferences fetched successfully',
        success: true,
      };
    } catch (err) {
      throw err;
    }
  }

  @Query(() => NotificationPreferencePaginationResponse)
  async findNotificationPreference(
    @Args('input') input: FindNotificationPreferenceInput,
  ) {
    const result =
      await this.notificationPreferenceService.findNotificationPreferenceWithPagination(
        input,
      );

    return {
      ...result,
      code: 200,
      message: 'Ok',
      success: true,
    };
  }

  @UseGuards(AuthGuard)
  @Mutation(() => NotificationPreferenceResponse)
  async updateNotificationPreference(
    @CurrentUser() user: User,
    @Args('input') input: UpdateNotificationPreferenceInput,
  ) {
    const { userId, ...preference } = input;
    const targetUserId = userId || user._id.toString();
    const result =
      await this.notificationPreferenceService.updateNotificationPreference(
        targetUserId,
        preference,
      );
    return {
      code: 200,
      message: 'Notification preference updated successfully',
      success: true,
      notificationPreference: result,
    };
  }

  @Mutation(() => BulkNotificationPrefResponse)
  async createDefaultNotificationPreferences(
    @Args('input') input: BulkCreateNotificationPrefInput,
  ) {
    const result =
      await this.notificationPreferenceService.bulkCreateDefaultPreferences(
        input.userIds,
      );

    return {
      success: true,
      code: 201,
      message: 'Processed notification preferences',
      result,
    };
  }
}
