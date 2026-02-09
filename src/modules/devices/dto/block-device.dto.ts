import { Field, FIELD_RESOLVER_MIDDLEWARE_METADATA, ID, InputType } from "@nestjs/graphql";
import { IsString } from "class-validator";

@InputType()
export class BlockDeviceInput {
     @Field(() => ID, { description: 'device id that should be blocked' })
     @IsString()
     deviceId: string
}