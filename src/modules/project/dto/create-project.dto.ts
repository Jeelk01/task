import { Field, ID, InputType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

@InputType()
export class CreateProjectInput {
  @Field(() => ID, {
    description: 'User who is creating the project',
    nullable: true,
  })
  creatorId?: string;

  @Field(() => ID, { description: 'Workspace in which project is created' })
  workspaceId: string;

  @Field(() => String, { description: 'Project name' })
  name: string;

  @Field(() => String, {
    description: 'Description for the project',
    nullable: true,
  })
  description?: string;

  @Field(() => GraphQLJSON, {
    description: 'key-value pair meta for the project',
    nullable: true,
  })
  meta?: Record<string, any>;

  @Field(() => [String], {
    description: 'Tags for the project',
    nullable: true,
  })
  tags?: string[];
}
