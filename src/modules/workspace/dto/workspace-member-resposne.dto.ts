import { Field, ObjectType } from '@nestjs/graphql';
import { BaseResponse } from 'src/common/helper/response/base.response';
import { WorkspaceMember } from '../entities/workspace-member.entity';
import { PaginatedResponse } from 'src/common/pagination/paginated-response.factory';

@ObjectType()
export class WorkspaceMemberResponse extends PaginatedResponse(
  WorkspaceMember,
) {}
