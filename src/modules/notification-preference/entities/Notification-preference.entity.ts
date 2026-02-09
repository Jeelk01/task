import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { BaseEntity } from "src/common/helper/entities/base.entity";
import { UserResponse } from "src/modules/users/dto/user-response-dto";
import { User } from "src/modules/users/entities/user.entity";

export type NotificationPreferenceDocument = HydratedDocument<NotificationPreference>

@ObjectType()
@Schema({ timestamps: true, versionKey: false })
export class NotificationPreference extends BaseEntity {

     @Field(() => ID)
     @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
     userId: Types.ObjectId

     @Field(() => User, { nullable: true })
     user?: User

     @Field(() => Boolean, { description: 'Invitation mail for workspace invites' })
     @Prop({ default: true })
     workspaceInvite: boolean

     @Field(() => Boolean, { description: 'Invitation mail for project invites' })
     @Prop({ default: true })
     projectInvite: boolean

     @Field(() => Boolean, { description: 'Information main for security events' })
     @Prop({ default: true })
     securityAlerts: boolean

     @Field(() => Boolean, { description: 'Invitation mail for task assign' })
     @Prop({ default: true })
     taskAssign: boolean

     @Field(() => Boolean, { description: 'Invitation mail for meeting invites' })
     @Prop({ default: true })
     meetingInvites: boolean

     @Field(() => Boolean, { description: 'Invitation mail for announcement' })
     @Prop({ default: true })
     announcement: boolean

     @Field(() => Boolean, { description: 'Promotional mail for this system' })
     @Prop({ default: true })
     promotional: boolean

}

export const NotificationPreferenceSchema = SchemaFactory.createForClass(NotificationPreference)
