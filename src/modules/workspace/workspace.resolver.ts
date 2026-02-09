import { Query, Mutation, Args, Resolver } from "@nestjs/graphql";
import { WorkspaceService } from "./workspace.service";
import { WorkspacePaginationResponse } from "./dto/workspace-pagination-response.dto";
import { FindWorkspaceWithPagination } from "./dto/find-workspace.dto";

@Resolver()
export class WorkspaceResolver {
     constructor(private readonly workspaceService: WorkspaceService) { }


     @Query(() => WorkspacePaginationResponse)
     async findWorkspaceWithPagination(@Args('input') input: FindWorkspaceWithPagination) {
          const { items, totalItems, totalPages, page, limit } = await this.workspaceService.findWithPagination(input);
          return { items, totalItems, totalPages, page, limit, code: 200, message: 'Workspaces fetched successfully', success: true};
     }
}
