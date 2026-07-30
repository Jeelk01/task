import { InputType, Field, ID } from '@nestjs/graphql';
import { IsMongoId, MinLength, IsOptional } from 'class-validator';

@InputType()
export class UpdateUserInput {
  @Field(() => ID, { description: 'User ID' })
  @IsMongoId()
  _id: string;

  @Field({ nullable: true, description: 'Updated name' })
  @IsOptional()
  @MinLength(3)
  name?: string;

  @Field({ nullable: true, description: 'Active status' })
  @IsOptional()
  isActive?: boolean;
}
