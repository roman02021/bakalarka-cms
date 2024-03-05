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
import { CreateObjectDto } from './dto/create-object.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { DeleteObjectDto } from './dto/delete-object.dto';

@Controller('collection')
@UseGuards(AuthGuard)
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {
    console.log('collection api route constructed');
  }

  @Get('/getObjectData/:routeId')
  getRouteData(@Param('routeId') routeId: number) {
    return this.collectionService.getObjectData(routeId);
  }
  @Get('/routes:')
  getObjects(@Param('routeId') routeId: number) {
    return this.collectionService.getObjects(routeId);
  }
  @Get('/getAllRoutes')
  getAllRoutes() {
    return this.collectionService.getAllRoutes();
  }
  @Get('/:route')
  getRouteDataByName(@Param('route') route: string) {
    return this.collectionService.getRouteDataByName(route);
  }
  @Delete('/:route/:id')
  deleteObject(@Param('route') route: string, @Param('id') id: number) {
    console.log(route, id);
    const deleteObjectDto: DeleteObjectDto = { name: route, objectId: id };

    return this.collectionService.deleteObject(deleteObjectDto);
  }

  @Post('/')
  createCollection(
    @Body(ValidationPipe) createCollectionDto: CreateCollectionDto,
    @Request() req,
  ) {
    const user = req.user;
    console.log(user);
    return this.collectionService.createCollection(createCollectionDto, user);
  }
  @Post('/createObject')
  createObject(@Body() createObjectDto: CreateObjectDto, @Request() req) {
    return this.collectionService.createObject(createObjectDto, req.user);
  }
}
