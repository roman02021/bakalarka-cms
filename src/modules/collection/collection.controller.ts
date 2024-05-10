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
  Put,
} from '@nestjs/common';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { CollectionService } from './collection.service';
import { AuthGuard } from '../auth/auth.guard';
import { User } from 'src/types/user';
import { UpdateCollectionDto } from './dto/update-collection.dto';

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

  @Put('/:collectionId')
  updateCollection(
    @Param('collectionId') collectionId: string,
    @Body() updateCollectionDto: UpdateCollectionDto,
  ) {
    return this.collectionService.updateCollection(
      collectionId,
      updateCollectionDto,
    );
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
}
