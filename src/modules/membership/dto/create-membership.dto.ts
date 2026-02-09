import { Field, InputType, Int, Float } from '@nestjs/graphql';
import { IsArray, IsBoolean, IsCurrency, IsEnum, IsInt, IsNumber, IsOptional, IsPositive, IsString, Length, Min, ValidateIf } from 'class-validator';
import { CURRENCY } from 'src/common/enum/currency.enum';

@InputType()
export class CreateMembershipInput {

     @Field(() => String, { description: "Unique plan name" })
     type: string;

     @Field(() => Float, { description: "Plan price" })
     price: number;

     @Field(() => CURRENCY, { description: "Currency code" })
     currency: CURRENCY;

     @Field(() => String, { nullable: true, description: "Plan description" })
     description?: string;

     @Field(() => [String], { nullable: true, description: "Optional tags" })
     tags?: string[];

     @Field(() => Boolean, { description: "Trial available?" })
     isTrialAvailable: boolean;

     @Field(() => Int, { nullable: true, description: "Length of trial period" })
     trialDurationDays?: number;

     @Field(() => Float, { nullable: true, description: "Discounted trial price" })
     trialPrice?: number;

     @Field(() => Int, { description: "Max workspaces allowed per account" })
     maxWorkspaces: number;

     @Field(() => Int, { description: "Max devices per account" })
     maxDevices: number;

     @Field(() => Int, { description: "Max projects per workspace" })
     maxProjectsPerWorkspace: number;

     @Field(() => Int, { description: "Max users per project" })
     maxUsersPerProject: number;

     @Field(() => Boolean, { description: "Cancelable plan?" })
     isCancellable: boolean;

     @Field(() => Int, { description: "Plan duration in days" })
     durationDays: number;

     @Field(() => Boolean, { nullable: true, description: "Is plan active?" })
     isActive?: boolean;
}

