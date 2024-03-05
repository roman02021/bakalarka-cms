import { Module } from '@nestjs/common';
import { AttributeService } from './attribute.service';

@Module({
  providers: [AttributeService]
})
export class AttributeModule {}
