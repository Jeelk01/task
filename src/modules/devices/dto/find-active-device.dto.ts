import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class FindActiveDeviceInput {
  @Field(() => ID, {
    description: 'User id for which we find the active devices',
  })
  userId: string;
}
