import { GraphQLError } from 'graphql'

export function gqlAuthError(message: string) {
  return new GraphQLError(message, {
    extensions: {
      code: 'UNAUTHENTICATED',
      status: 401,
    },
  })
}

export function gqlNotFoundError(message: string) {
  return new GraphQLError(message, {
    extensions: {
      code: 'NOT_FOUND',
      status: 404,
    },
  })
}

export function gqlBadRequestError(message: string) {
  return new GraphQLError(message, {
    extensions: {
      code: 'BAD_REQUEST',
      status: 400,
    },
  })
}
