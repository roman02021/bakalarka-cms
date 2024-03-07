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
} from '@nestjs/common';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { CollectionService } from './collection.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/types/user';

@Controller('collection')
@UseGuards(AuthGuard)
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {
    console.log('collection api route constructed');
  }

  @Get('/all')
  getAllCollections() {
    return this.collectionService.getAllCollections();
  }

  @Delete('/:collection')
  deleteCollection(@Param('collection') collection: string) {
    return this.collectionService.deleteCollection(collection);
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
