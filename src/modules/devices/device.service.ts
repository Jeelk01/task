import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model, Types } from "mongoose"
import { Device } from "./entities/device.entity"
import {
  gqlBadRequestError,
  gqlNotFoundError,
} from "src/common/error/gql-error"

@Injectable()
export class DeviceService {
  constructor(
    @InjectModel(Device.name)
    private readonly deviceModel: Model<Device>
  ) {}

  async findByDeviceId(deviceId: string) {
    return this.deviceModel.findOne({ deviceId }).lean()
  }

  async findActiveDevices(userId: string) {
    return this.deviceModel
      .find({
        userId: new Types.ObjectId(userId),
        isRevoked: false,
        isBlocked: false,
      })
      .sort({ lastLoginAt: -1 })
      .lean()
  }

  async findAllDevices(userId: string) {
    return this.deviceModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ lastLoginAt: -1 })
      .lean()
  }

  async upsertDeviceSession(params: {
    userId: string
    deviceId: string
    deviceName?: string
    userAgent?: string
    ip?: string
    refreshTokenHash: string
    jti: string
    expiresAt: Date
  }) {
    const {
      userId,
      deviceId,
      deviceName,
      userAgent,
      ip,
      refreshTokenHash,
      jti,
      expiresAt,
    } = params

    return this.deviceModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId), deviceId },
      {
        userId: new Types.ObjectId(userId),
        deviceId,
        deviceName,
        userAgent,
        ip,
        refreshTokenHash,
        jti,
        expiresAt,
        lastLoginAt: new Date(),
        isRevoked: false,
        isBlocked: false,
      },
      { upsert: true, new: true }
    )
  }

  async logoutDevice(userId: string, deviceId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw gqlBadRequestError("Invalid userId")
    }

    const device = await this.deviceModel
      .findOneAndUpdate(
        {
          userId: new Types.ObjectId(userId),
          deviceId,
        },
        { $set: { isRevoked: true } },
        { new: true }
      )
      .lean()

    if (!device) {
      throw gqlNotFoundError("Active device session not found")
    }

    return device
  }

  async blockDevice(userId: string, deviceId: string) {
    const device = await this.deviceModel
      .findOneAndUpdate(
        { userId: new Types.ObjectId(userId), deviceId },
        { $set: { isBlocked: true, isRevoked: true } },
        { new: true }
      )
      .lean()

    if (!device) {
      throw gqlNotFoundError("Device not found")
    }

    return device
  }

  async unblockDevice(userId: string, deviceId: string) {
    const device = await this.deviceModel
      .findOneAndUpdate(
        { userId: new Types.ObjectId(userId), deviceId },
        { $set: { isBlocked: false } },
        { new: true }
      )
      .lean()

    if (!device) {
      throw gqlNotFoundError("Device not found")
    }

    return device
  }

  async logoutAllExcept(userId: string, excludeDeviceId: string) {
    await this.deviceModel.updateMany(
      {
        userId: new Types.ObjectId(userId),
        deviceId: { $ne: excludeDeviceId },
        isBlocked: false,
      },
      { $set: { isRevoked: true } }
    )

    return true
  }

  async logoutAllDevices(userId: string) {
    await this.deviceModel.updateMany(
      { userId: new Types.ObjectId(userId) },
      { $set: { isRevoked: true } }
    )

    return true
  }

  async deleteRevokedDevices(userId: string) {
    return this.deviceModel.deleteMany({
      userId: new Types.ObjectId(userId),
      isRevoked: true,
    })
  }

  async validateDeviceSession(userId: string, deviceId: string, jti: string) {
    return this.deviceModel.findOne({
      userId: new Types.ObjectId(userId),
      deviceId,
      jti,
      isRevoked: false,
      isBlocked: false,
    })
  }
}
