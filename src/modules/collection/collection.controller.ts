import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Request,
  Delete,
  ValidationPipe,
  Query,
} from '@nestjs/common';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { CollectionService } from './collection.service';
import { AuthGuard } from '../auth/auth.guard';
import { User } from 'src/types/user';
import { Collection } from './entities/collection.entity';

@Controller('collection')
@UseGuards(AuthGuard)
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {
    console.log('collection api route constructed');
  }

  @Get('/')
  getAllCollections() {
    return this.collectionService.getAllCollections();
  }

  @Get('/:collectionId')
  getAllCollection(@Param('collectionId') collectionId: number) {
    return this.collectionService.getCollectionById(collectionId);
  }

  @Delete('/:collectionId')
  deleteCollection(@Param('collectionId') collectionId: number) {
    return this.collectionService.deleteCollection(collectionId);
  }

  @Post('/')
  createCollection(
    @Body(ValidationPipe) createCollectionDto: CreateCollectionDto,
    @Request() req,
  ) {
    const user: User = req.user;
    return this.collectionService.createCollection(createCollectionDto, user);
    return 1;
  }
}
