import { CallHandler, ExecutionContext, Injectable } from '@nestjs/common';
import { map } from 'rxjs/operators';
import { camelCase } from 'lodash';
import ApiResponse from 'src/types/apiResponse';
import { Observable } from 'rxjs';
@Injectable()
export class ApiInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // console.log(context, 'context');
    function transformToCamelCase(object: Record<string, any>) {
      console.log(object, 'object');
      const transformedObject = Object.fromEntries(
        Object.entries(object).map(([k, v]) => {
          if (Array.isArray(v)) {
            const transformedChild = v.map((a) => transformToCamelCase(a));
            return [camelCase(k), transformedChild];
          } else {
            return [camelCase(k), v];
          }
        }),
      );

      return transformedObject;
    }

    return next.handle().pipe(
      map((data: ApiResponse) => {
        console.log(data, 'yoo');
        const transformedItems = data.items?.map((data) =>
          transformToCamelCase(data),
        );
        return {
          ...data,
          items: transformedItems,
        };
      }),
    );
  }
}
