import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ROLE } from 'src/common/enum/role.enum';
import { BaseEntity } from 'src/common/helper/entities/base.entity';

export type userDocument = HydratedDocument<User>;

@ObjectType()
@Schema({ timestamps: true, versionKey: false })
export class User extends BaseEntity {
  @Field(() => String, { description: 'Name of the User' })
  @Prop({ required: true })
  name: string;

  @Field(() => String, { description: 'Email of the User' })
  @Prop({
    required: true,
    lowercase: true,
    index: true,
    unique: true,
    trim: true,
  })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ default: 0 })
  tokenVersion: number;

  @Field(() => Boolean, { description: 'Is User Verified?' })
  @Prop({ default: false })
  isVerified: boolean;

  @Field(() => Date, {
    description: 'Date when user was verified',
    nullable: true,
  })
  @Prop({ default: null })
  verifiedAt: Date;

  @Field(() => ROLE, { description: 'User role' })
  @Prop({ required: true, enum: ROLE, default: ROLE.USER })
  role: ROLE;

  @Field(() => Boolean, { description: 'Is User Active?' })
  @Prop({ default: true })
  isActive: boolean;

  @Field(() => String, { nullable: true, description: 'User is createdBy' })
  @Prop({ default: null, type: Types.ObjectId, ref: 'User' })
  createdBy?: Types.ObjectId | null;

  @Field(() => String, {
    nullable: true,
    description: 'Avatar URL of the User',
  })
  @Prop({ type: String, default: null })
  avatar?: string | null;

  @Field(() => User, { nullable: true })
  creator?: User;
}

export const UserSchema = SchemaFactory.createForClass(User);
