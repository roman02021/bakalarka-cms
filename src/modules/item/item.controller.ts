import {
  Controller,
  Post,
  Body,
  Param,
  Request,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { ItemsService } from './item.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { AuthGuard } from '../auth/auth.guard';
import { User } from 'src/types/user';

@Controller('item')
@UseGuards(AuthGuard)
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Post('/:collection')
  createItem(
    @Param('collection') collection: string,
    @Body() attributes: Record<string, any>,
    @Request() req,
  ) {
    const user: User = req.user;
    return this.itemsService.createItem(collection, attributes, user);
  }
  @Delete('/:collection/:id')
  deleteItem(@Param('id') id: number, @Param('collection') collection: string) {
    return this.itemsService.deleteItem(collection, id);
  }
}
