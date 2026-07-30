import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { NotificationPreference } from './entities/Notification-preference.entity';
import { FindNotificationPreferenceInput } from './dto/find-notification-preference-pagination.dto';
import { DEFAULT_NOTIFICATION_PREFS } from './default-config';
import {
  gqlBadRequestError,
  gqlNotFoundError,
} from 'src/common/error/gql-error';

@Injectable()
export class NotificationPreferenceService {
  constructor(
    @InjectModel(NotificationPreference.name)
    private readonly model: Model<NotificationPreference>,
  ) {}

  /* =======================
     GET
  ======================= */
  async get(userId: string) {
    return this.model.findOne({ userId: new Types.ObjectId(userId) }).lean();
  }

  /* =======================
     UPSERT
  ======================= */
  async upsert(userId: string, preferences: Partial<NotificationPreference>) {
    return this.model.updateOne(
      { userId },
      { $set: preferences },
      { upsert: true },
    );
  }

  /* =======================
     CREATE DEFAULT
  ======================= */
  async createDefaultPreference(userId: string) {
    const existing = await this.model.findOne({ userId });

    if (existing) {
      throw gqlBadRequestError('Notification record already exists');
    }

    return this.model.create({
      userId,
      ...DEFAULT_NOTIFICATION_PREFS,
    });
  }

  /* =======================
     BULK CREATE DEFAULTS
  ======================= */
  async bulkCreateDefaultPreferences(userIds: string[]) {
    const validIds = userIds
      .filter((id) => Types.ObjectId.isValid(id))
      .map((id) => new Types.ObjectId(id));

    if (!validIds.length) {
      return {
        created: [],
        skipped: [],
        failed: [...userIds],
      };
    }

    const existing = await this.model
      .find({ userId: { $in: validIds } }, { userId: 1 })
      .lean();

    const existingSet = new Set(existing.map((e) => e.userId.toString()));

    const toCreate = validIds
      .filter((id) => !existingSet.has(id.toString()))
      .map((id) => ({
        userId: id,
        ...DEFAULT_NOTIFICATION_PREFS,
      }));

    let createdDocs: NotificationPreference[] = [];
    let failed: string[] = [];

    if (toCreate.length) {
      try {
        createdDocs = await this.model.insertMany(toCreate, {
          ordered: false,
        });
      } catch (err: any) {
        const createdSet = new Set(
          (err?.insertedDocs ?? []).map((d: any) => d.userId.toString()),
        );

        failed = toCreate
          .map((d) => d.userId.toString())
          .filter((id) => !createdSet.has(id));
      }
    }

    return {
      created: createdDocs,
      skipped: Array.from(existingSet),
      failed,
    };
  }

  /* =======================
     CHECK SINGLE PREF
  ======================= */
  async checkPref(userId: string, preferenceKey: string) {
    const userPreference = await this.model.findOne({ userId }).lean();

    if (!userPreference) {
      throw gqlNotFoundError('Notification preferences not found');
    }

    return (userPreference as any)[preferenceKey];
  }

  /* =======================
     FIND WITH PAGINATION
  ======================= */
  async findNotificationPreferenceWithPagination(
    input: FindNotificationPreferenceInput,
  ) {
    const {
      page = 1,
      limit = 10,
      workspaceInvites,
      projectInvites,
      securityAlerts,
      taskAssign,
      meetingInvites,
      announcement,
      promotional,
      userId,
    } = input;

    const query: any = {};

    if (workspaceInvites !== undefined)
      query.workspaceInvites = workspaceInvites;
    if (projectInvites !== undefined) query.projectInvites = projectInvites;
    if (securityAlerts !== undefined) query.securityAlerts = securityAlerts;
    if (taskAssign !== undefined) query.taskAssign = taskAssign;
    if (meetingInvites !== undefined) query.meetingInvites = meetingInvites;
    if (announcement !== undefined) query.announcement = announcement;
    if (promotional !== undefined) query.promotional = promotional;
    if (userId) query.userId = userId;

    const totalItems = await this.model.countDocuments(query);

    const items = await this.model
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return {
      items,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      page,
      limit,
    };
  }

  /* =======================
     UPDATE
  ======================= */
  async updateNotificationPreference(
    userId: string,
    preference: Partial<NotificationPreference>,
  ) {
    const result = await this.model.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { $set: preference },
      { new: true },
    );

    if (!result) {
      throw gqlNotFoundError('Notification preferences not found');
    }

    return result;
  }
}
