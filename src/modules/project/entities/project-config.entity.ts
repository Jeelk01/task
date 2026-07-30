import {
  Field,
  GraphQLISODateTime,
  ID,
  Int,
  ObjectType,
} from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Project } from './project.entity';
import { BaseEntity } from 'src/common/helper/entities/base.entity';
import { User } from 'src/modules/users/entities/user.entity';

export type ProjectConfigDocument = HydratedDocument<ProjectConfig>;

@ObjectType()
@Schema({ timestamps: true, versionKey: false })
export class ProjectConfig extends BaseEntity {
  @Field(() => ID, { description: 'Project id for which config is set' })
  @Prop({ type: Types.ObjectId, required: true })
  ProjectId: Types.ObjectId;

  @Field(() => Project, { nullable: true })
  Project?: Project | null;

  @Field(() => Boolean, { description: 'Is Chat enabled for this Project' })
  @Prop({ type: Boolean, default: false })
  isChatEnabled: boolean;

  @Field(() => Int, {
    description: 'Maximum number of members allowed in the Project',
  })
  @Prop({ type: Number, default: null })
  maxMembers?: number | null;

  @Field(() => Int, {
    description: 'Maximum number of projects allowed in the Project',
  })
  @Prop({ type: Number, default: null })
  maxProjects?: number | null;

  @Field(() => Int, {
    description: 'Maximum users per project allowed in the Project',
  })
  @Prop({ type: Number, default: null })
  maxUsersPerProject?: number | null;

  @Field(() => String, { description: 'Configuration note or details' })
  @Prop({ type: String, trim: true })
  configNote: string;

  @Field(() => ID, { description: 'User id who set this configuration' })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  configuredBy: Types.ObjectId;

  @Field(() => User, { nullable: true })
  configuror: User | null;

  @Field(() => GraphQLISODateTime, {
    description: 'When this configuration was set',
  })
  @Prop({ type: Date, default: Date.now })
  configuredAt: Date;
}

export const ProjectConfigSchema = SchemaFactory.createForClass(ProjectConfig);

ProjectConfigSchema.index({ ProjectId: 1 });
