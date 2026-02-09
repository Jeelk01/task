import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  HttpException,
} from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'
import { Observable, throwError } from 'rxjs'
import { catchError } from 'rxjs/operators'
import { GraphQLError } from 'graphql'
import { gqlError } from './graphql-error.util'

@Injectable()
export class GraphqlErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const gqlCtx = GqlExecutionContext.create(context)
    if (!gqlCtx.getContext()) {
      return next.handle()
    }

    return next.handle().pipe(
      catchError((error) => {
        // Already GraphQL-safe
        if (error instanceof GraphQLError) {
          return throwError(() => error)
        }

        // HttpException → GraphQL
        if (error instanceof HttpException) {
          const status = error.getStatus()
          const response = error.getResponse() as any

          return throwError(() =>
            gqlError(
              typeof response === 'string'
                ? response
                : response?.message || 'Request failed',
              mapHttpStatusToGqlCode(status),
              status,
              {
                name: error.name,
                message: error.message,
                stacktrace: error.stack?.split('\n'),
              }
            )
          )
        }

        // Unknown error
        return throwError(() =>
          gqlError(
            error?.message || 'Internal server error',
            'INTERNAL_SERVER_ERROR',
            500
          )
        )
      })
    )
  }
}

function mapHttpStatusToGqlCode(status: number): string {
  switch (status) {
    case 400:
      return 'BAD_USER_INPUT'
    case 401:
      return 'UNAUTHENTICATED'
    case 403:
      return 'FORBIDDEN'
    case 404:
      return 'NOT_FOUND'
    case 409:
      return 'CONFLICT'
    default:
      return 'INTERNAL_SERVER_ERROR'
  }
}
