import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { ItemsService } from '../modules/item/item.service';
import { RelationsService } from 'src/relations/relations.service';

@Module({
  controllers: [ApiController],
  providers: [ItemsService, RelationsService],
})
export class ApiModule {}
