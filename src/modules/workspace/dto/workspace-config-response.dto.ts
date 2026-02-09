import { Field, ObjectType } from "@nestjs/graphql";
import { BaseResponse } from "src/common/helper/response/base.response";
import { WorkspaceConfig } from "../entities/worksapce-config.entity";

@ObjectType()
export class WorkspaceResponse extends BaseResponse {
     @Field(() => WorkspaceConfig, { nullable: true, description: 'Workspace configuration details' })
     workspaceConfig?: WorkspaceConfig | null;
}
