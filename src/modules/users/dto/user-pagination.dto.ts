import { PaginatedResponse } from "src/common/pagination/paginated-response.factory";
import { User } from "../entities/user.entity";
import { ObjectType } from "@nestjs/graphql";

@ObjectType()
export class UserPaginationResponse extends PaginatedResponse(User) { }