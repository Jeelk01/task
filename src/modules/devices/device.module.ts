import { Global, Module } from "@nestjs/common";
import { DeviceService } from "./device.service";
import { UserModule } from "../users/users.module";
import { DeviceResolver } from "./device.resolver";
import { MongooseModule } from "@nestjs/mongoose";
import { Device, DeviceSchema } from "./entities/device.entity";
import { AdminDeviceResolver } from "./admin-device.resolver";

@Global()
@Module({
     imports: [UserModule, MongooseModule.forFeature([{
          name: Device.name, schema: DeviceSchema
     }])],
     providers: [DeviceService, DeviceResolver, AdminDeviceResolver],
     exports: [DeviceService]
})
export class DeviceModule { }