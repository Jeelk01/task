import { Field, ID, InputType } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

@InputType()
export class CreateWorkspaceInput {
  @Field(() => String, { description: 'Workspace name' })
  @IsString()
  name: string;

  @Field(() => String, { description: 'Description for the workspace' })
  @IsString()
  description: string;

  @Field(() => GraphQLJSON, {
    description: 'key-value pair meta for the workspace',
    nullable: true,
  })
  @IsOptional()
  meta: object;

  @Field(() => [String], {
    description: 'Tags for the workspace',
    nullable: true,
  })
  @IsOptional()
  tags: string[];
}
