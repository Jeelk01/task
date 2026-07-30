declare module 'graphql-upload-ts' {
  import { RequestHandler } from 'express';

  export const GraphQLUpload: any;

  export function graphqlUploadExpress(options?: {
    maxFileSize?: number;
    maxFiles?: number;
  }): RequestHandler;
}
