import { Scalar } from '@nestjs/graphql';
import { GraphQLUpload } from 'graphql-upload-ts';

@Scalar('Upload')
export class UploadScalar {
     description = 'GraphQL Upload scalar type';
     parseValue(value) {
          return GraphQLUpload.parseValue(value);
     }
     serialize(value) {
          return value;
     }
     parseLiteral(ast) {
          return GraphQLUpload.parseLiteral(ast, ast.value);
     }
}
