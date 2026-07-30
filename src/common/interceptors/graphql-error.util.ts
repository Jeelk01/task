import { GraphQLError } from 'graphql';

export function gqlError(
  message: string,
  code: string,
  status?: number,
  exception?: any,
) {
  return new GraphQLError(message, {
    extensions: {
      code,
      status,
      exception,
    },
  });
}
