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
import { AuthGuard } from '../auth/auth.guard';
import { User } from 'src/types/user';

@Controller('collection')
@UseGuards(AuthGuard)
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  @Get('/')
  getAllCollections() {
    return this.collectionService.getAllCollections();
  }

  @Get('/:collectionId')
  getAllCollection(@Param('collectionId') collectionId: string) {
    return this.collectionService.getCollectionById(collectionId);
  }

  @Delete('/:collectionId')
  deleteCollection(@Param('collectionId') collectionId: string) {
    return this.collectionService.deleteCollection(collectionId);
  }

  @Post('/')
  createCollection(
    @Body(ValidationPipe) createCollectionDto: CreateCollectionDto,
    @Request() req,
  ) {
    const user: User = req.user;
    return this.collectionService.createCollection(createCollectionDto, user);
  }

  @Post('/v2')
  createCollectionTest(
    @Body(ValidationPipe) createCollectionDto: CreateCollectionDto,
    @Request() req,
  ) {
    const user: User = req.user;
    return this.collectionService.createCollectionTest(
      createCollectionDto,
      user,
    );
  }
}
