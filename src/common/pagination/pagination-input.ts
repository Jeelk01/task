import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsOptional, Min } from 'class-validator';

@InputType()
export class PaginationInput {
  @Field(() => Int, {
    defaultValue: 1,
    description: 'Pagination input limit per page',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit: number;

  @Field(() => Int, {
    defaultValue: 10,
    description: 'Pagination input page number',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  page: number;
}
