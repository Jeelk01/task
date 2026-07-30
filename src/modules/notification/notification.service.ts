import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationType } from './entities/notification.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
  ) {}

  async createNotification(
    recipientId: string,
    type: NotificationType,
    data: any,
  ) {
    return await this.notificationModel.create({
      recipientId: new Types.ObjectId(recipientId),
      type,
      data,
    });
  }

  async findMyNotifications(userId: string, limit = 50) {
    return await this.notificationModel
      .find({ recipientId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async markAsRead(notificationId: string, userId: string) {
    return await this.notificationModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(notificationId),
        recipientId: new Types.ObjectId(userId),
      },
      { isRead: true },
      { new: true },
    );
  }

  async markAllAsRead(userId: string) {
    await this.notificationModel.updateMany(
      { recipientId: new Types.ObjectId(userId), isRead: false },
      { isRead: true },
    );
    return true;
  }

  async deleteNotification(notificationId: string, userId: string) {
    await this.notificationModel.deleteOne({
      _id: new Types.ObjectId(notificationId),
      recipientId: new Types.ObjectId(userId),
    });
    return true;
  }
}
