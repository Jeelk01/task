import { Field, ObjectType } from "@nestjs/graphql";
import { NotificationPreference } from "../entities/Notification-preference.entity";
import { BaseResponse } from "src/common/helper/response/base.response";

@ObjectType()
export class BulkNotificationPrefResult {
     @Field(() => [NotificationPreference])
     created: NotificationPreference[];

     @Field(() => [String])
     skipped: string[];

     @Field(() => [String])
     failed: string[];
}


@ObjectType()
export class BulkNotificationPrefResponse extends BaseResponse {

     @Field(() => BulkNotificationPrefResult)
     result: BulkNotificationPrefResult;
}