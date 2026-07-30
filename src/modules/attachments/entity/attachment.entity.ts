import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { BaseEntity } from 'src/common/helper/entities/base.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Workspace } from 'src/modules/workspace/entities/workspace.entity';
import { Project } from 'src/modules/project/entities/project.entity';
import { Task } from 'src/modules/task/entity/task.entity';

export type AttachmentDocument = HydratedDocument<Attachment>;

@ObjectType()
@Schema({ timestamps: true, versionKey: false })
export class Attachment extends BaseEntity {
  @Field(() => ID)
  @Prop({ type: Types.ObjectId, ref: 'Workspace', required: true })
  workspaceId: Types.ObjectId;

  @Field(() => Workspace, { nullable: true })
  workspace?: Workspace;

  @Field(() => ID, { nullable: true })
  @Prop({ type: Types.ObjectId, ref: 'Project', default: null })
  projectId?: Types.ObjectId;

  @Field(() => Project, { nullable: true })
  project?: Project;

  @Field(() => ID, { nullable: true })
  @Prop({ type: Types.ObjectId, ref: 'Task', default: null })
  taskId?: Types.ObjectId;

  @Field(() => Task, { nullable: true })
  task?: Task;

  @Field(() => String, { description: 'File path or URL' })
  @Prop({ required: true, trim: true })
  filepath: string;

  @Field(() => String, { description: 'Original file name' })
  @Prop({ required: true, trim: true })
  fileName: string;

  @Field(() => String, { description: 'Mime type of the file' })
  @Prop({ required: true, trim: true })
  type: string;

  @Field(() => Number, { description: 'File size in bytes', nullable: true })
  @Prop({ type: Number, default: 0 })
  size?: number;

  @Field(() => String, {
    description: 'Optional comment on the attachment',
    nullable: true,
  })
  @Prop({ trim: true, default: '' })
  comment?: string;

  @Field(() => ID, { description: 'User who uploaded the attachment' })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  uploadedBy: Types.ObjectId;

  @Field(() => User, { nullable: true })
  uploader?: User;
}

export const AttachmentSchema = SchemaFactory.createForClass(Attachment);
AttachmentSchema.index({ workspaceId: 1 });
AttachmentSchema.index({ taskId: 1 });
