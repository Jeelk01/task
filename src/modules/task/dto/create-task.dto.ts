import { InputType, Field, ID, PartialType } from '@nestjs/graphql';
import { TaskPriority } from 'src/common/enum/task-priority.enum';
import { TaskStatus } from 'src/common/enum/task-status.enum';

@InputType()
export class CreateTaskInput {
  @Field(() => ID, { description: 'Workspace ID' })
  workspaceId: string;

  @Field(() => ID, { description: 'Project ID' })
  projectId: string;

  @Field(() => [ID], {
    description: 'Users assigned to the task',
    nullable: true,
  })
  assignedTo?: string[];

  @Field(() => String, { description: 'Title or short note for the task' })
  note: string;

  @Field(() => TaskStatus, { description: 'Task status', nullable: true })
  status?: TaskStatus;

  @Field(() => TaskPriority, { description: 'Task priority', nullable: true })
  priority?: TaskPriority;

  @Field(() => ID, { description: 'Blocker task reference', nullable: true })
  blockerId?: string;

  @Field(() => [ID], {
    description: 'Attachments for the task',
    nullable: true,
  })
  attachments?: string[];

  @Field(() => [String], { description: 'Tags for the task', nullable: true })
  tags?: string[];

  @Field(() => String, { description: 'Due date for the task', nullable: true })
  dueDate?: string;
}

@InputType()
export class UpdateTaskInput extends PartialType(CreateTaskInput) {
  @Field(() => ID, { description: 'Task ID' })
  id: string;
}
