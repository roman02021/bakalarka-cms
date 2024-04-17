import {
  Controller,
  Post,
  Body,
  Param,
  Request,
  UseGuards,
  Delete,
  Get,
  Put,
  Query,
} from '@nestjs/common';
import { ItemsService } from './item.service';

import { AuthGuard } from '../auth/auth.guard';
import { User } from 'src/types/user';

@Controller('item')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @UseGuards(AuthGuard)
  @Post('/:collection')
  createItem(
    @Param('collection') collection: string,
    @Body() attributes: Record<string, any>,
    @Request() req,
  ) {
    const user: User = req.user;
    return this.itemsService.createItem(collection, attributes, user);
  }
  @UseGuards(AuthGuard)
  @Get('/:collection')
  getItems(
    @Param('collection') collection: string,
    @Query('populate') relationsToPopulate: string[] = [],
  ) {
    return this.itemsService.getItems(collection, relationsToPopulate);
  }
  @UseGuards(AuthGuard)
  @Get('/:collection/:id')
  getItem(
    @Param('collection') collection: string,
    @Param('id') id: number,
    @Query('populate') relationsToPopulate: string[],
  ) {
    return this.itemsService.getItem(collection, id, relationsToPopulate);
  }
  @UseGuards(AuthGuard)
  @Put('/:collection/:id')
  updateItem(
    @Param('id') id: number,
    @Param('collection') collection: string,
    @Body() attributes: Record<string, any>,
  ) {
    return this.itemsService.updateItem(collection, id, attributes);
  }
  @UseGuards(AuthGuard)
  @Delete('/:collection/:id')
  deleteItem(@Param('id') id: number, @Param('collection') collection: string) {
    return this.itemsService.deleteItem(collection, id);
  }
}
