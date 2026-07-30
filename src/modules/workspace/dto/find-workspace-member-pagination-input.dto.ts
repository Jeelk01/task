import { Field, GraphQLISODateTime, ID, InputType } from '@nestjs/graphql';
import {
  IsEmail,
  isEmail,
  IsOptional,
  IsString,
  isString,
} from 'class-validator';
import { WorkspaceMemberStatus } from 'src/common/enum/workspace-member-status';
import { WorkspaceRole } from 'src/common/enum/workspace-role.enum';
import { PaginationInput } from 'src/common/pagination/pagination-input';

@InputType()
export class FindWorkspaceMemberWithPagination extends PaginationInput {
  @Field(() => ID, {
    nullable: true,
    description: 'Workspace Id to find members',
  })
  @IsOptional()
  @IsString()
  workspaceId?: string;

  @Field(() => ID, { nullable: true, description: 'User Id to find member' })
  @IsOptional()
  @IsString()
  userId?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Search keyword to find member by user name or email',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Field(() => WorkspaceRole, {
    nullable: true,
    description: 'Role to filter workspace members',
  })
  @IsOptional()
  @IsString()
  role?: WorkspaceRole;

  @Field(() => WorkspaceMemberStatus, {
    nullable: true,
    description: 'Status to filter workspace members',
  })
  @IsOptional()
  @IsString()
  status?: WorkspaceMemberStatus;

  @Field(() => ID, {
    nullable: true,
    description: 'Invited By user Id to filter workspace members',
  })
  @IsOptional()
  @IsString()
  invitedBy?: string;

  @Field(() => ID, {
    nullable: true,
    description: 'Removed By user Id to filter workspace members',
  })
  @IsOptional()
  @IsString()
  removedBy?: string;

  @Field(() => GraphQLISODateTime, {
    nullable: true,
    description: 'Find members invited after this date',
  })
  @IsOptional()
  invitedAfter?: Date;

  @Field(() => GraphQLISODateTime, {
    nullable: true,
    description: 'Find members invited before this date',
  })
  @IsOptional()
  invitedBefore?: Date;
}
