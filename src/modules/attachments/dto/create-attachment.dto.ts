import { InputType, Field, ID, Int } from '@nestjs/graphql';

@InputType()
export class CreateAttachmentInput {
  @Field(() => ID)
  workspaceId: string;

  @Field(() => ID, { nullable: true })
  projectId?: string;

  @Field(() => ID, { nullable: true })
  taskId?: string;

  @Field(() => String, { description: 'File path or URL' })
  filepath: string;

  @Field(() => String, { description: 'Original file name' })
  fileName: string;

  @Field(() => String, { description: 'Mime type of the file' })
  type: string;

  @Field(() => Int, { description: 'File size in bytes', nullable: true })
  size?: number;

  @Field(() => String, {
    description: 'Optional comment on the attachment',
    nullable: true,
  })
  comment?: string;

  @Field(() => ID, {
    description: 'User who uploaded the attachment',
    nullable: true,
  })
  uploadedBy?: string;
}
