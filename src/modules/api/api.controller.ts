import { Controller, Get, Param, Query, UseInterceptors } from '@nestjs/common';
import { ItemsService } from '../item/item.service';
import { ApiInterceptor } from './api.interceptor';
import ApiQueryParameters from 'src/types/queryParameters';

@Controller('api')
export class ApiController {
  constructor(private readonly itemsService: ItemsService) {}
  @Get('/:collection')
  @UseInterceptors(ApiInterceptor)
  getItems(
    @Param('collection') collection: string,
    @Query('populate') relationsToPopulate: string[] = [],
    @Query('offset') offset: number = 0,
    @Query('limit') limit: number = 15,
    @Query('sortBy') sortBy: string = 'item_order',
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc',
  ) {
    const queryParameters: ApiQueryParameters = {
      populate: relationsToPopulate,
      offset,
      limit,
      sortBy,
      sortOrder,
    };

    return this.itemsService.getItems(collection, queryParameters);
  }
  @Get('/:collection/:id')
  getItem(
    @Param('collection') collection: string,
    @Param('id') id: number,
    @Query('populate') relationsToPopulate: string[],
  ) {
    return this.itemsService.getItem(collection, id, relationsToPopulate);
  }
  // @Post('/:collection')
  // createItem(
  //   @Param('collection') collection: string,
  //   @Body() item: any,
  //   @Request() req,
  // ) {
  //   const user: User = req.user;
  //   return this.itemsService.createItem(collection, item);
  // }
}
