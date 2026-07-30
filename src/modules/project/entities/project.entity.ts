import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import GraphQLJSON from 'graphql-type-json';
import { HydratedDocument, Types } from 'mongoose';
import { BaseEntity } from 'src/common/helper/entities/base.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Workspace } from 'src/modules/workspace/entities/workspace.entity';

export type ProjectDocument = HydratedDocument<Project>;

@ObjectType()
@Schema({ timestamps: true, versionKey: false })
export class Project extends BaseEntity {
  @Field(() => ID, { description: 'creator of the Project' })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  creatorId: Types.ObjectId;

  @Field(() => User, { nullable: true })
  creator?: User;

  @Field(() => ID, { description: 'workspace of the Project' })
  @Prop({ type: Types.ObjectId, ref: 'Workspace', required: true })
  workspaceId: Types.ObjectId;

  @Field(() => Workspace, { nullable: true })
  workspace?: Workspace;

  @Field(() => String)
  @Prop({ required: true, trim: true })
  name: string;

  @Field(() => [String])
  @Prop({})
  tags: string[];

  @Field(() => String, { nullable: true })
  @Prop({ trim: true })
  description?: string;

  @Field(() => GraphQLJSON, {
    nullable: true,
    description: 'Other details to add as key-value pair',
  })
  @Prop({ type: Object, default: {} })
  meta?: Record<string, any>;

  @Field(() => [ID], { description: 'Member user IDs in this project' })
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  members: Types.ObjectId[];

  @Field(() => String, { nullable: true })
  myRole?: string;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
ProjectSchema.index({ workspaceId: 1 });
