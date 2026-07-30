import { Field, ObjectType } from '@nestjs/graphql';
import { BaseResponse } from 'src/common/helper/response/base.response';
import { Device } from '../entities/device.entity';

@ObjectType()
export class MultiDevicesResponse extends BaseResponse {
  @Field(() => [Device], { nullable: true })
  devices?: Device[] | null;
}
