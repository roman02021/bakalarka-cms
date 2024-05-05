import { Injectable } from '@nestjs/common';
import { map } from 'rxjs/operators';
import { camelCase } from 'lodash';
@Injectable()
export class ApiInterceptor {
  intercept(context, next) {
    function transformToCamelCase(object: Record<string, unknown>) {
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
      map((data: Record<string, unknown>[]) => {
        console.log(data, 'yoo');
        const transformedData = data.map((data) => transformToCamelCase(data));
        return transformedData;
      }),
    );
  }
}
