import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export abstract class BaseResponse {
  @Field(() => Int)
  code: number;

  @Field(() => String)
  message: string;

  @Field(() => Boolean)
  success: boolean;
}
