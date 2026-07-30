import { Field, InputType } from '@nestjs/graphql';
import { LoginInput } from './login-input.dto';

@InputType()
export class ResolveDeviceConflictInput extends LoginInput {
  @Field(() => String, { description: 'deviceId to logout' })
  deviceIdToLogout: string;
}
