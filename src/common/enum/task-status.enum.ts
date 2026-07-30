import { registerEnumType } from '@nestjs/graphql';

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  BLOCKER = 'blocker',
}

registerEnumType(TaskStatus, {
  name: 'TaskStatus',
  description: 'Describe the status of the task.',
});
