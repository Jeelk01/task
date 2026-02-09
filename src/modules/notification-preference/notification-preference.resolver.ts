import { Args, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { NotificationPreferenceService } from "./notification-preference.service";
import { NotificationPreferencePaginationResponse } from "./dto/notification-preference-pagination.dto";
import { FindNotificationPreferenceInput } from "./dto/find-notification-preference-pagination.dto";
import { User } from "../users/entities/user.entity";
import { NotificationPreference } from "./entities/Notification-preference.entity";
import { UserService } from "../users/users.service";
import { NotificationPreferenceResponse } from "./dto/notification-preference-response.dto";
import { UpdateNotificationPreferenceInput } from "./dto/update-notification-preference.dto";
import { BulkNotificationPrefResponse } from "./dto/bult-notification-preference-response.dto";
import { BulkCreateNotificationPrefInput } from "./dto/bulk-default-notification-preference-input.dto";

@Resolver(() => NotificationPreference)
export class NotificationPreferenceResolver {
     constructor(private readonly notificationPreferenceService: NotificationPreferenceService,
          private readonly userService: UserService
     ) { }

     @ResolveField(() => User, { name: 'user' })
     async getUser(@Parent() pref: NotificationPreference) {
          return this.userService.findById(pref.userId.toString())
     }

     @Query(() => NotificationPreferencePaginationResponse)
     async findNotificationPreference(@Args('input') input: FindNotificationPreferenceInput) {
          const result = await this.notificationPreferenceService.findNotificationPreferenceWithPagination(input)

          return {
               ...result,
               code: 200,
               message: 'Ok',
               success: true
          }
     }

     // @Mutation(() => NotificationPreferenceResponse)
     // async updateNotificationPreference(@Args('input') input: UpdateNotificationPreferenceInput) {
     //      const { userId, ...preference } = input


     // }

     @Mutation(() => BulkNotificationPrefResponse)
     async createDefaultNotificationPreferences(
          @Args('input') input: BulkCreateNotificationPrefInput
     ) {
          const result = await this.notificationPreferenceService.bulkCreateDefaultPreferences(
               input.userIds
          );

          return {
               success: true,
               code: 201,
               message: "Processed notification preferences",
               result
          };
     }
}