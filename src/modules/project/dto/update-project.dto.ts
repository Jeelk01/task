import { InputType, Field, PartialType } from '@nestjs/graphql';
import { CreateProjectInput } from './create-project.dto';

@InputType()
export class UpdateProjectInput extends PartialType(CreateProjectInput) {}
