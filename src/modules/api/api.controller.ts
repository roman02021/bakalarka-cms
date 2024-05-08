import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ItemsService } from '../item/item.service';
import { ApiInterceptor } from './api.interceptor';
import { User } from '../user/entities/user.entity';

@Controller('api')
export class ApiController {
  constructor(private readonly itemsService: ItemsService) {}
  @Get('/:collection')
  @UseInterceptors(ApiInterceptor)
  getItems(
    @Param('collection') collection: string,
    @Query('populate') relationsToPopulate: string[] = [],
    @Query('startFrom') startFrom: number = 0,
    @Query('limit') limit: number = 15,
    @Query('sortBy') sortBy: string = '',
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc',
  ) {
    const queryParameters: QueryParameters = {
      populate: relationsToPopulate,
      startFrom,
      limit,
      sortBy,
      sortOrder,
    };

    return this.itemsService.getItems(collection, parameters);
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
