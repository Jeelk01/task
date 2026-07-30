import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ProjectMemberStatus } from 'src/common/enum/project-member-status';
import { ProjectRole } from 'src/common/enum/project-role.enum';
import { BaseEntity } from 'src/common/helper/entities/base.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Project } from './project.entity';

@ObjectType()
@Schema({ timestamps: true, versionKey: false })
export class ProjectMember extends BaseEntity {
  @Field(() => ID, {
    nullable: true,
    description: 'User id to include into the the project',
  })
  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId?: Types.ObjectId | null;

  @Field(() => User, { nullable: true })
  user?: User | null;

  @Field(() => String, { description: 'email of the invited user' })
  @Prop({ trim: true, loadClass: true, required: true })
  email: string;

  @Field(() => ID, {
    name: 'invitedById',
    description: 'User who have invited to other',
  })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  invitedBy: Types.ObjectId;

  @Field(() => User, { name: 'invitedBy', nullable: true })
  invitedByUser?: User;

  @Field(() => ProjectMemberStatus, {
    description: 'status of the workspace member',
  })
  @Prop({
    type: String,
    enum: ProjectMemberStatus,
    default: ProjectMemberStatus.INVITED,
  })
  status: ProjectMemberStatus;

  @Field(() => ProjectRole, { description: 'Role of the workspace member' })
  @Prop({ type: String, enum: ProjectRole, default: ProjectRole.MEMBER })
  role: ProjectRole;

  @Field(() => ID, { description: 'Workspace in which person is invited' })
  @Prop({ type: Types.ObjectId, ref: 'Workspace', required: true })
  projectId: Types.ObjectId;

  @Field(() => Project, { nullable: true })
  project: Project | null;
}

export const ProjectMemberSchema = SchemaFactory.createForClass(ProjectMember);
