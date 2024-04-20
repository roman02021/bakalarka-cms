import { Module } from '@nestjs/common';
import { ItemsService } from './item.service';
import { ItemsController } from './item.controller';
import { RelationsService } from '../../relations/relations.service';

@Module({
  controllers: [ItemsController],
  providers: [ItemsService, RelationsService],
})
export class ItemsModule {}
