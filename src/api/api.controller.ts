import { Controller, Get, Param, Query, UseInterceptors } from '@nestjs/common';
import { ItemsService } from '../modules/item/item.service';
import { ApiInterceptor } from './api.interceptor';

@Controller('api')
export class ApiController {
  constructor(private readonly itemsService: ItemsService) {}
  @Get('/:collection')
  @UseInterceptors(ApiInterceptor)
  getItems(
    @Param('collection') collection: string,
    @Query('populate') relationsToPopulate: string[] = [],
  ) {
    return this.itemsService.getItems(collection, relationsToPopulate);
  }
  @Get('/:collection/:id')
  getItem(
    @Param('collection') collection: string,
    @Param('id') id: number,
    @Query('populate') relationsToPopulate: string[],
  ) {
    return this.itemsService.getItem(collection, id, relationsToPopulate);
  }
}
