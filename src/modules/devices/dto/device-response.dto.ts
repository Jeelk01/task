import { Field, ObjectType } from '@nestjs/graphql';
import { BaseResponse } from 'src/common/helper/response/base.response';
import { Device } from '../entities/device.entity';

@ObjectType()
export class DeviceResponse extends BaseResponse {
  @Field(() => Device, { nullable: true, description: 'Device description' })
  device?: Device | null;
}
