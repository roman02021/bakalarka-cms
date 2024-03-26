import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class ValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    console.log(value, value.data, 'test');
    const parsedData = JSON.parse(value.data);
    return {
      ...value,
      parsedData,
    };
  }
}
