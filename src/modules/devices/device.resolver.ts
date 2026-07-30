import { Resolver, ResolveField, Mutation, Args, Query } from '@nestjs/graphql';
import { DeviceService } from './device.service';
import { BlockDeviceInput } from './dto/block-device.dto';
import { DeviceResponse } from './dto/device-response.dto';
import { MultiDevicesResponse } from './dto/multi-devices-response.dto';
import { FindActiveDeviceInput } from './dto/find-active-device.dto';
import { BaseResponse } from 'src/common/helper/response/base.response';
import { LogoutDeviceInput } from './dto/logout-device.dto';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { CurrentDevice } from 'src/common/decorator/current-device.decorator';
import { Device } from './entities/device.entity';

@Resolver()
export class DeviceResolver {
  constructor(private readonly deviceService: DeviceService) {}

  @Query(() => MultiDevicesResponse)
  async findActiveDevices(@Args('input') input: FindActiveDeviceInput) {
    const devices = await this.deviceService.findActiveDevices(input.userId);

    return {
      code: 200,
      success: true,
      message: 'Active devices fetched successfully.',
      devices,
    };
  }

  @UseGuards(AuthGuard)
  @Query(() => MultiDevicesResponse)
  async findMyDevices(@CurrentUser() user: User) {
    const devices = await this.deviceService.findAllDevices(
      user._id.toString(),
    );

    return {
      code: 200,
      success: true,
      message: 'Devices fetched successfully.',
      devices,
    };
  }

  @UseGuards(AuthGuard)
  @Mutation(() => DeviceResponse)
  async blockMyDevice(
    @Args('input') input: BlockDeviceInput,
    @CurrentUser() user: User,
  ) {
    const device = await this.deviceService.blockDevice(
      user._id.toString(),
      input.deviceId,
    );

    return {
      code: 200,
      success: true,
      message: 'Device blocked successfully.',
      device,
    };
  }

  @UseGuards(AuthGuard)
  @Mutation(() => DeviceResponse)
  async logoutDevice(
    @Args('input') input: LogoutDeviceInput,
    @CurrentUser() user: User,
  ) {
    console.log('In side the logout device mutation resolver');

    const device = await this.deviceService.logoutDevice(
      user._id.toString(),
      input.deviceId,
    );

    return {
      code: 200,
      success: true,
      message: 'Device logged out successfully.',
      device,
    };
  }

  @Mutation(() => BaseResponse)
  async logoutAllDevices(@CurrentUser() user: User) {
    await this.deviceService.logoutAllDevices(user._id.toString());

    return {
      code: 200,
      success: true,
      message: 'All devices logged out successfully',
    };
  }

  @UseGuards(AuthGuard)
  @Mutation(() => BaseResponse)
  async logoutAllDevicesExceptCurrent(
    @CurrentUser() user: User,
    @CurrentDevice() device: Device,
  ) {
    await this.deviceService.logoutAllExcept(
      user._id.toString(),
      device._id.toString(),
    );

    return {
      code: 200,
      success: true,
      message: 'Other devices logged out.',
    };
  }
}
