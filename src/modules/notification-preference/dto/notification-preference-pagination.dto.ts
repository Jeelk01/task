import { ObjectType } from "@nestjs/graphql";
import { PaginatedResponse } from "src/common/pagination/paginated-response.factory";
import { NotificationPreference } from "../entities/Notification-preference.entity";

@ObjectType()
export class NotificationPreferencePaginationResponse extends PaginatedResponse(NotificationPreference) { }