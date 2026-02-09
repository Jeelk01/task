import { Field, GraphQLISODateTime, ID, ObjectType } from "@nestjs/graphql";
import { Types } from "mongoose";

@ObjectType()
export abstract class BaseEntity {
     @Field(() => ID, { description: 'Unique Document identifier for the Entity' })
     _id: Types.ObjectId;

     @Field(() => GraphQLISODateTime, { description: 'Timestamp when the Entity was created' })
     createdAt: Date;

     @Field(() => GraphQLISODateTime, { description: 'Timestamp when the Entity was last updated' })
     updatedAt: Date;
}