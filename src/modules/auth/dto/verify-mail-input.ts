import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class VerifyEmailInput {
  @Field(() => String, { description: 'email verification token' })
  token: string;
}
