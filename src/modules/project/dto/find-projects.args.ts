import { InputType, Field, ID } from '@nestjs/graphql';
import { IsOptional, IsString, IsArray } from 'class-validator';
import { PaginationInput } from 'src/common/pagination/pagination-input';

@InputType()
export class FindProjectsArgs extends PaginationInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  workspaceId?: string;

  @Field(() => [String], { nullable: true, description: 'Filter by tags' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @Field(() => String, {
    nullable: true,
    description: 'Fuzzy search by project name or description',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
