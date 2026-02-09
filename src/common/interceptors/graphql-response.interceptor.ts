import {
     CallHandler,
     ExecutionContext,
     Injectable,
     NestInterceptor,
} from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'
import { Observable, map } from 'rxjs'

@Injectable()
export class GraphqlResponseInterceptor implements NestInterceptor {
     intercept(
          context: ExecutionContext,
          next: CallHandler
     ): Observable<any> {
          const gqlCtx = GqlExecutionContext.create(context)

          // Only apply to GraphQL
          if (!gqlCtx.getContext()) {
               return next.handle()
          }

          return next.handle().pipe(
               map((data) => ({
                    ...data
               }))
          )
     }
}
