import { Resolver, Mutation, Query, Args } from "@nestjs/graphql";
import { DeviceService } from "./device.service";
import { MultiDevicesResponse } from "./dto/multi-devices-response.dto";
import { DeviceResponse } from "./dto/device-response.dto";
import { BlockDeviceInput } from "./dto/block-device.dto";
import { LogoutDeviceInput } from "./dto/logout-device.dto";
import { BaseResponse } from "src/common/helper/response/base.response";

@Resolver()
export class AdminDeviceResolver {
     constructor(private readonly deviceService: DeviceService) { }

     @Query(() => MultiDevicesResponse)
     async adminFindUserDevices(@Args('userId') userId: string) {
          const devices = await this.deviceService.findAllDevices(userId);

          return {
               code: 200,
               success: true,
               message: 'User devices fetched successfully.',
               devices
          };
     }

     @Mutation(() => DeviceResponse)
     async adminBlockDevice(@Args('input') input: BlockDeviceInput, @Args('userId') userId: string) {
          const device = await this.deviceService.blockDevice(userId, input.deviceId);

          return {
               code: 200,
               success: true,
               message: 'Device blocked by admin.',
               device
          };
     }

     @Mutation(() => DeviceResponse)
     async adminUnblockDevice(@Args('input') input: BlockDeviceInput, @Args('userId') userId: string) {
          const device = await this.deviceService.unblockDevice(userId, input.deviceId);

          return {
               code: 200,
               success: true,
               message: 'Device unblocked.',
               device
          };
     }

     @Mutation(() => DeviceResponse)
     async adminLogoutDevice(@Args('input') input: LogoutDeviceInput, @Args('userId') userId: string) {
          const device = await this.deviceService.logoutDevice(userId, input.deviceId);

          return {
               code: 200,
               success: true,
               message: 'Device logged out by admin.',
               device
          };
     }

     @Mutation(() => BaseResponse)
     async adminLogoutAllDevices(@Args('userId') userId: string) {
          await this.deviceService.logoutAllDevices(userId);

          return {
               code: 200,
               success: true,
               message: 'All devices revoked by admin.'
          };
     }
}
