import { ObjectType, Field } from "@nestjs/graphql";
import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { BaseEntity } from "src/common/helper/entities/base.entity";

export type ProjectDocument = HydratedDocument<Project>

@ObjectType()
@Schema({ timestamps: true, versionKey: false })
export class Project {
     
}

export const ProjectSchema = SchemaFactory.createForClass(Project)