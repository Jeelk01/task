import { Field, ObjectType } from "@nestjs/graphql";
import { BaseResponse } from "src/common/helper/response/base.response";
import { Workspace } from "../entities/workspace.entity";

@ObjectType()
export class WorkspaceResponse extends BaseResponse {
     @Field(() => Workspace, { nullable: true, description: 'Workspace details' })
     workspace?: Workspace | null;
}

