import { Field, ObjectType } from "@nestjs/graphql";
import { BaseResponse } from "src/common/helper/response/base.response";
import { NotificationPreference } from "../entities/Notification-preference.entity";

@ObjectType()
export class NotificationPreferenceResponse extends BaseResponse {
     @Field(() => NotificationPreference, { nullable: true, description: 'Notification preference document' })
     notificationPreference?: NotificationPreference | null

}