import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Notification } from './entities/notification.entity';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { User } from 'src/modules/users/entities/user.entity';

@Resolver(() => Notification)
export class NotificationResolver {
  constructor(private readonly notificationService: NotificationService) {}

  @Query(() => [Notification])
  @UseGuards(AuthGuard)
  async myNotifications(@CurrentUser() user: User) {
    return await this.notificationService.findMyNotifications(
      user._id.toString(),
    );
  }

  @Mutation(() => Notification)
  @UseGuards(AuthGuard)
  async markNotificationRead(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
  ) {
    return await this.notificationService.markAsRead(id, user._id.toString());
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  async markAllNotificationsRead(@CurrentUser() user: User) {
    return await this.notificationService.markAllAsRead(user._id.toString());
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  async deleteNotification(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
  ) {
    return await this.notificationService.deleteNotification(
      id,
      user._id.toString(),
    );
  }
}
