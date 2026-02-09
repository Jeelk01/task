import { ObjectType } from "@nestjs/graphql";
import { PaginatedResponse } from "src/common/pagination/paginated-response.factory";
import { AccountSubscription } from "../entities/account-subscription.entity";

@ObjectType()
export class SubscriptionPagination extends PaginatedResponse(AccountSubscription) { }
