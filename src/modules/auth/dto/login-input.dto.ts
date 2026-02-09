import { Field, InputType } from "@nestjs/graphql";
import { IsEmail, IsIP, IsString, MinLength } from "class-validator";


@InputType()
export class LoginInput {
     @IsString()
     @IsEmail()
     @Field(() => String, { description: 'User email for login' })
     email: string;

     @IsString()
     @MinLength(6)
     @Field(() => String)
     password: string;

     @IsString()
     @Field(() => String)
     deviceId: string;

     @IsString()
     @Field(() => String, { nullable: true, description: 'User device name' })
     deviceName?: string;

     @IsIP()
     @Field(() => String, { nullable: true, description: 'User Device ip' })
     ip?: string;

     @IsString()
     @Field(() => String, { nullable: true, description: 'User browser' })
     userAgent?: string;

}