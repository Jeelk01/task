import { registerEnumType } from '@nestjs/graphql';

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

registerEnumType(TaskPriority, {
  name: 'TaskPriority',
  description: 'Describe the priority of the task.',
});
