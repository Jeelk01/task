import { Field, GraphQLISODateTime, ID, InputType } from '@nestjs/graphql';
import { IsEmail, IsOptional, IsString } from 'class-validator';
import { ProjectMemberStatus } from 'src/common/enum/project-member-status';
import { ProjectRole } from 'src/common/enum/project-role.enum';
import { PaginationInput } from 'src/common/pagination/pagination-input';

@InputType()
export class FindProjectMemberWithPagination extends PaginationInput {
  @Field(() => ID, {
    nullable: true,
    description: 'Project Id to find members',
  })
  @IsOptional()
  @IsString()
  projectId?: string;

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

  @Field(() => ProjectRole, {
    nullable: true,
    description: 'Role to filter project members',
  })
  @IsOptional()
  @IsString()
  role?: ProjectRole;

  @Field(() => ProjectMemberStatus, {
    nullable: true,
    description: 'Status to filter project members',
  })
  @IsOptional()
  @IsString()
  status?: ProjectMemberStatus;

  @Field(() => ID, {
    nullable: true,
    description: 'Invited By user Id to filter project members',
  })
  @IsOptional()
  @IsString()
  invitedBy?: string;
}
