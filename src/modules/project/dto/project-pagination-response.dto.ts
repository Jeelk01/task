import { ObjectType } from '@nestjs/graphql';
import { Project } from '../entities/project.entity';
import { PaginatedResponse } from 'src/common/pagination/paginated-response.factory';

@ObjectType()
export class ProjectPaginationResponse extends PaginatedResponse(Project) {}
