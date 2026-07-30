import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsString, IsArray } from 'class-validator';
import { PaginationInput } from 'src/common/pagination/pagination-input';

@InputType()
export class FindWorkspacesArgs extends PaginationInput {
  @Field(() => [String], { nullable: true, description: 'Filter by tags' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @Field(() => String, {
    nullable: true,
    description: 'Fuzzy search by name or description',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => Boolean, {
    nullable: true,
    description: 'Filter by active status',
  })
  @IsOptional()
  isActive?: boolean;
}
