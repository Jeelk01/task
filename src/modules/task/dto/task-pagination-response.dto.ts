import { ObjectType } from '@nestjs/graphql';
import { Task } from '../entity/task.entity';
import { PaginatedResponse } from 'src/common/pagination/paginated-response.factory';

@ObjectType()
export class TaskPaginationResponse extends PaginatedResponse(Task) {}
