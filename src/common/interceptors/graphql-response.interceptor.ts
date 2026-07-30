import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable, map } from 'rxjs';

@Injectable()
export class GraphqlResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const gqlCtx = GqlExecutionContext.create(context);

    // Only apply to GraphQL
    if (!gqlCtx.getContext()) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => {
        if (Array.isArray(data)) {
          return data.map((item) =>
            item &&
            typeof item === 'object' &&
            typeof item.toObject === 'function'
              ? item.toObject()
              : item,
          );
        }
        if (
          data &&
          typeof data === 'object' &&
          typeof data.toObject === 'function'
        ) {
          return data.toObject();
        }
        return data;
      }),
    );
  }
}
