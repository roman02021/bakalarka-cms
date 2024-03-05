import { Module } from '@nestjs/common';
import { ItemsService } from './item.service';
import { ItemsController } from './item.controller';

@Module({
  controllers: [ItemsController],
  providers: [ItemsService],
})
export class ItemsModule {}
