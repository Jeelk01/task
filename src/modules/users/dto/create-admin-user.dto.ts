import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty, MinLength } from "class-validator";

@InputType()
export class CreateAdminUserInput {
     @Field(() => String, { description: 'Admin User name' })
     @IsNotEmpty()
     @MinLength(3)
     name: String
     
}