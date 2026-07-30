import { Field, ObjectType } from '@nestjs/graphql';
import { BaseResponse } from 'src/common/helper/response/base.response';
import { User } from 'src/modules/users/entities/user.entity';
import { Device } from 'src/modules/devices/entities/device.entity';

@ObjectType()
export class AuthResponse extends BaseResponse {
  @Field(() => String, {
    nullable: true,
    description: 'access token that should be send with each api call.',
  })
  accessToken?: string;

  @Field(() => String, {
    nullable: true,
    description: 'refresh token for updating access token',
  })
  refreshToken?: string;

  @Field(() => User, { nullable: true, description: 'User document' })
  user?: User;

  @Field(() => Boolean, {
    nullable: true,
    description: 'Flag for device limit reached',
  })
  deviceLimitReached?: boolean;

  @Field(() => [Device], {
    nullable: true,
    description: 'List of active devices for conflict resolution',
  })
  activeDevices?: Device[];
}
