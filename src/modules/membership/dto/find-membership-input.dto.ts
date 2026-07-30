import { Field, ID, InputType } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { NumberRangeInput } from 'src/common/dto/number-range-input.dto';
import { CURRENCY } from 'src/common/enum/currency.enum';
import { BaseResponse } from 'src/common/helper/response/base.response';
import { PaginationInput } from 'src/common/pagination/pagination-input';
import { User } from 'src/modules/users/entities/user.entity';

@InputType()
export class FindMembership extends PaginationInput {
  @Field(() => ID, { nullable: true, description: 'Membership id' })
  @IsOptional()
  @IsString()
  _id?: string;

  @Field(() => String, { nullable: true, description: 'Membership Type' })
  @IsOptional()
  @IsString()
  type?: string;

  @Field(() => CURRENCY, {
    nullable: true,
    description: 'currency in which payment take place',
  })
  @IsOptional()
  @IsString()
  currency?: CURRENCY;

  @IsOptional()
  @Field(() => NumberRangeInput, {
    nullable: true,
    description: 'price range ',
  })
  price?: NumberRangeInput;

  @IsOptional()
  @Field(() => NumberRangeInput, {
    nullable: true,
    description: 'duration days range',
  })
  durationDays?: NumberRangeInput;

  @IsOptional()
  @Field(() => NumberRangeInput, {
    nullable: true,
    description: 'trial price range',
  })
  trialPrice?: NumberRangeInput;

  @IsOptional()
  @Field(() => NumberRangeInput, {
    nullable: true,
    description: 'trial duration days range',
  })
  trialDurationDays?: NumberRangeInput;

  @IsOptional()
  @Field(() => NumberRangeInput, {
    nullable: true,
    description: 'Max projects allowed per workspace',
  })
  projectsPerWorkspace?: NumberRangeInput;

  @IsOptional()
  @Field(() => NumberRangeInput, {
    nullable: true,
    description: 'Max users allowed per project',
  })
  usersPerProject?: NumberRangeInput;

  @Field(() => Boolean, {
    nullable: true,
    description: 'Trial available for membership plan',
  })
  @IsOptional()
  @IsBoolean()
  isTrialAvailable?: boolean;

  @Field(() => [String], {
    nullable: true,
    description: 'membership plan tags',
  })
  @IsOptional()
  tags?: string[];

  @Field(() => Boolean, {
    nullable: true,
    description: 'is Membership plan active ?',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @Field(() => Boolean, {
    nullable: true,
    description: 'is Membership plan cancellable ?',
  })
  @IsOptional()
  @IsBoolean()
  isCancellable?: boolean;

  @Field(() => ID, {
    nullable: true,
    description: 'Who created the Membership Plan',
  })
  @IsOptional()
  @IsString()
  createdBy?: string;
}
