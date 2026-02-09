import { ObjectType, Field, ID, GraphQLISODateTime } from "@nestjs/graphql";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { BaseEntity } from "src/common/helper/entities/base.entity";
import { Workspace } from "./workspace.entity";
import { User } from "src/modules/users/entities/user.entity";
import { WorkspaceMemberStatus } from "src/common/enum/workspace-member-status";
import { WorkspaceRole } from "src/common/enum/workspace-role.enum";

export type WorkspaceMemberDocument = HydratedDocument<WorkspaceMember>;

@ObjectType()
@Schema({ timestamps: true, versionKey: false })
export class WorkspaceMember extends BaseEntity {
     @Field(() => ID, { nullable: true, description: 'User id to include into the the workspace' })
     @Prop({ type: Types.ObjectId, ref: 'User' })
     userId?: Types.ObjectId | null;

     @Field(() => User, { nullable: true })
     user?: User | null;

     @Field(() => String, { description: 'email of the invited user' })
     @Prop({ trim: true, loadClass: true, required: true })
     email: string;

     @Field(() => ID, { description: 'User who have invited to other' })
     @Prop({ type: Types.ObjectId, ref: 'User', required: true })
     invitedBy: Types.ObjectId;

     @Field(() => WorkspaceMemberStatus, { description: 'status of the workspace member' })
     @Prop({ type: String, enum: WorkspaceMemberStatus, default: WorkspaceMemberStatus.INVITED })
     status: WorkspaceMemberStatus;

     @Field(() => WorkspaceRole, { description: 'Role of the workspace member' })
     @Prop({ type: String, enum: WorkspaceRole, default: WorkspaceRole.MEMBER })
     role: WorkspaceRole;

     @Field(() => ID, { description: "Workspace in which person is invited" })
     @Prop({ type: Types.ObjectId, ref: 'Workspace', required: true })
     workspaceId: Types.ObjectId;

     @Field(() => Workspace, { nullable: true })
     workspace: Workspace | null

     @Field(() => GraphQLISODateTime, { nullable: true, description: 'user accepted the invitation' })
     @Prop({ type: Date, default: null })
     acceptedAt?: Date

     @Field(() => GraphQLISODateTime, { nullable: true, description: 'user removed the invitation' })
     @Prop({ type: Date, default: null })
     removedAt?: Date

     @Field(() => ID, { description: 'User who have removed the user' })
     @Prop({ type: Types.ObjectId, ref: 'User', required: true })
     removedBy: Types.ObjectId;     
}

export const WorkspaceMemberSchema = SchemaFactory.createForClass(WorkspaceMember);

WorkspaceMemberSchema.index({ workspaceId: 1, email: 1 }, { unique: true });
WorkspaceMemberSchema.index({ workspaceId: 1, userId: 1 }, { unique: true });