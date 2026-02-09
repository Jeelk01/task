import { PaginatedResponse } from "src/common/pagination/paginated-response.factory";
import { Membership } from "../entities/membership.entity";
import { ObjectType } from "@nestjs/graphql";

@ObjectType()
export class MembershipPagination extends PaginatedResponse(Membership)  { }