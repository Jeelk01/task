import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

@InputType()
export class CreateUserInput {
  @Field(() => String, { description: 'User name' })
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @Field(() => String, { description: 'User email' })
  @IsEmail()
  email: string;

  @Field(() => String, { description: 'User password' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
