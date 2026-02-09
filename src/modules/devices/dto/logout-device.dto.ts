import { Field, ID, InputType } from "@nestjs/graphql";

@InputType()
export class LogoutDeviceInput {
     @Field(() => ID, { description: 'deviceId to logout' })
     deviceId: string;
}