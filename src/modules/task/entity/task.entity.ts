import { ObjectType, Field, ID, GraphQLISODateTime } from '@nestjs/graphql';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { BaseEntity } from 'src/common/helper/entities/base.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Workspace } from 'src/modules/workspace/entities/workspace.entity';
import { Project } from 'src/modules/project/entities/project.entity';
import { TaskStatus } from 'src/common/enum/task-status.enum';
import { TaskPriority } from 'src/common/enum/task-priority.enum';
import { Attachment } from 'src/modules/attachments/entity/attachment.entity';

export type TaskDocument = HydratedDocument<Task>;

@ObjectType()
@Schema({ timestamps: true, versionKey: false })
export class Task extends BaseEntity {
  @Field(() => ID, { description: 'Workspace ID' })
  @Prop({ type: Types.ObjectId, ref: 'Workspace', required: true })
  workspaceId: Types.ObjectId;

  @Field(() => Workspace, { nullable: true })
  workspace?: Workspace;

  @Field(() => ID, { description: 'Project ID' })
  @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
  projectId: Types.ObjectId;

  @Field(() => Project, { nullable: true })
  project?: Project;

  @Field(() => ID, { description: 'User who created/assigned the task' })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  assignedBy: Types.ObjectId;

  @Field(() => User, { nullable: true })
  assigner?: User;

  @Field(() => [ID], { description: 'Users assigned to the task' })
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  assignedTo: Types.ObjectId[];

  @Field(() => [User], { nullable: true })
  assignees?: User[];

  @Field(() => String, { description: 'Title or short note for the task' })
  @Prop({ required: true, trim: true })
  note: string;

  @Field(() => TaskStatus, { description: 'Task status' })
  @Prop({ type: String, enum: TaskStatus, default: TaskStatus.PENDING })
  status: TaskStatus;

  @Field(() => TaskPriority, { description: 'Task priority' })
  @Prop({ type: String, enum: TaskPriority, default: TaskPriority.MEDIUM })
  priority: TaskPriority;

  @Field(() => ID, { description: 'Blocker task reference', nullable: true })
  @Prop({ type: Types.ObjectId, ref: 'Task', default: null })
  blockerId?: Types.ObjectId;

  @Field(() => Task, { nullable: true })
  blockerTask?: Task;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @Prop({ type: Date, default: null })
  completedAt?: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @Prop({ type: Date, default: Date.now })
  assignedAt?: Date;

  @Field(() => [ID], { description: 'Attachments for the task' })
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Attachment' }], default: [] })
  attachments: Types.ObjectId[];

  @Field(() => [Attachment], { nullable: true })
  attachmentsList?: Attachment[];

  @Field(() => [String], { description: 'Tags for the task' })
  @Prop({ type: [String], default: [] })
  tags: string[];

  @Field(() => GraphQLISODateTime, { nullable: true })
  @Prop({ type: Date, default: null })
  dueDate?: Date;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
TaskSchema.index({ workspaceId: 1 });
TaskSchema.index({ projectId: 1 });
