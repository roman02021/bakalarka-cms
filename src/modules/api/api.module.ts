import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { ItemsService } from '../item/item.service';
import { RelationsService } from '../../relations/relations.service';

@Module({
  controllers: [ApiController],
  providers: [ItemsService, RelationsService],
})
export class ApiModule {}
