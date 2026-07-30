import { Field, ObjectType } from '@nestjs/graphql';
import { ProjectMember } from '../entities/project-member.entity';
import { PaginatedResponse } from 'src/common/pagination/paginated-response.factory';

@ObjectType()
export class ProjectMemberResponse extends PaginatedResponse(ProjectMember) {}
