import { Field, ObjectType } from "@nestjs/graphql";
import { Workspace } from "../entities/workspace.entity";
import { PaginatedResponse } from "src/common/pagination/paginated-response.factory";


@ObjectType()
export class WorkspacePaginationResponse extends PaginatedResponse(Workspace) { }