import { Field, Float, InputType } from '@nestjs/graphql';

@InputType()
export class NumberRangeInput {
     @Field(() => Float, { nullable: true, description: "number range starts" })
     start?: number;

     @Field(() => Float, { nullable: true, description: "number range ends" })
     end?: number;
}
