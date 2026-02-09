import { ObjectType, Field, ID, GraphQLISODateTime } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { HydratedDocument, Types } from "mongoose"
import { BaseEntity } from "src/common/helper/entities/base.entity"
import { User } from "src/modules/users/entities/user.entity"
import GraphQLJSON from "graphql-type-json"

export type WorkspaceDocument = HydratedDocument<Workspace>

@ObjectType()
@Schema({ timestamps: true, versionKey: false })
export class Workspace extends BaseEntity {
     @Field(() => ID, { description: "Workspace owner user id" })
     @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
     ownerId: Types.ObjectId

     @Field(() => User, { nullable: true })
     owner?: User

     @Field(() => String)
     @Prop({ required: true, trim: true })
     name: string

     @Field(() => [String])
     @Prop({})
     tags: string[]

     @Field(() => String, { nullable: true })
     @Prop({ trim: true })
     description?: string

     @Field(() => Boolean)
     @Prop({ default: true })
     isActive: boolean

     @Field(() => GraphQLJSON, { nullable: true, description: 'Other details to add as key-value pair' })
     @Prop({ type: Object, default: {} })
     meta?: Record<string, any>
}

export const WorkspaceSchema = SchemaFactory.createForClass(Workspace)

WorkspaceSchema.index({ ownerId: 1 })   
WorkspaceSchema.index({ isActive: 1 })
