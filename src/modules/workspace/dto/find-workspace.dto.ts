import { Field, ID, InputType } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { PaginationInput } from 'src/common/pagination/pagination-input';

@InputType()
export class FindWorkspaceWithPagination extends PaginationInput {
  @Field(() => ID, { nullable: true, description: 'Workspace Id ' })
  @IsOptional()
  @IsString()
  workspaceId?: string;

  @Field(() => ID, { nullable: true, description: 'Owner Id' })
  @IsOptional()
  @IsString()
  ownerId?: string;

  @Field(() => String, {
    nullable: true,
    description:
      'general search term for workspace name, description, tags, meta',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => Boolean, {
    nullable: true,
    description: 'isActive status of workspace',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @Field(() => ID, {
    nullable: true,
    description: 'Member user id to filter workspaces in which user is member',
  })
  @IsOptional()
  @IsString()
  memberId?: string;
}
