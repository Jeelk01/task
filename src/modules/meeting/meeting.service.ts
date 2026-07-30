import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Meeting, MeetingStatus } from './entities/meeting.entity';

@Injectable()
export class MeetingService {
  constructor(
    @InjectModel(Meeting.name) private meetingModel: Model<Meeting>,
  ) {}

  async create(createMeetingData: {
    title: string;
    description?: string;
    workspaceId: string;
    hostId: string;
    startTime: Date;
  }): Promise<Meeting> {
    const meeting = new this.meetingModel({
      ...createMeetingData,
      workspaceId: new Types.ObjectId(createMeetingData.workspaceId),
      hostId: new Types.ObjectId(createMeetingData.hostId),
    });
    return meeting.save();
  }

  async findByWorkspace(workspaceId: string): Promise<Meeting[]> {
    return this.meetingModel
      .find({ workspaceId: new Types.ObjectId(workspaceId) })
      .sort({ startTime: -1 })
      .exec();
  }

  async findById(id: string): Promise<Meeting> {
    const meeting = await this.meetingModel.findById(id).exec();
    if (!meeting) throw new NotFoundException('Meeting not found');
    return meeting;
  }

  async updateStatus(id: string, status: MeetingStatus): Promise<Meeting> {
    const meeting = await this.findById(id);
    meeting.status = status;
    if (status === MeetingStatus.ENDED) {
      meeting.endTime = new Date();
    }
    return meeting.save();
  }
}
