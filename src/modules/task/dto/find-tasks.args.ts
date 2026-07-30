import { InputType, Field, ID } from '@nestjs/graphql';
import { IsOptional, IsString, IsArray, IsEnum } from 'class-validator';
import { TaskStatus } from 'src/common/enum/task-status.enum';
import { TaskPriority } from 'src/common/enum/task-priority.enum';
import { PaginationInput } from 'src/common/pagination/pagination-input';

@InputType()
export class FindTasksArgs extends PaginationInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  workspaceId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  projectId?: string;

  @Field(() => [TaskStatus], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEnum(TaskStatus, { each: true })
  status?: TaskStatus[];

  @Field(() => [TaskPriority], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEnum(TaskPriority, { each: true })
  priority?: TaskPriority[];

  @Field(() => [ID], {
    nullable: true,
    description: 'Filter by one or more assignees',
  })
  @IsOptional()
  @IsArray()
  assignedTo?: string[];

  @Field(() => [ID], {
    nullable: true,
    description: 'Filter by one or more creators',
  })
  @IsOptional()
  @IsArray()
  assignedBy?: string[];

  @Field(() => [String], { nullable: true, description: 'Filter by tags' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @Field(() => String, {
    nullable: true,
    description: 'Fuzzy search by note content',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
