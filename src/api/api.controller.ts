import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Request,
  Delete,
} from '@nestjs/common';
import { CreateRouteDto } from './dto/create-route.dto';
import { ApiService } from './api.service';
import { CreateObjectDto } from './dto/create-object.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { DeleteObjectDto } from './dto/delete-object.dto';

@Controller('api')
@UseGuards(AuthGuard)
export class ApiController {
  constructor(private readonly apiService: ApiService) {
    console.log('api route const ructed');
  }

  @Get('/getObjectData/:routeId')
  getRouteData(@Param('routeId') routeId: number) {
    return this.apiService.getObjectData(routeId);
  }
  @Get('/getAllRoutes')
  getAllRoutes() {
    return this.apiService.getAllRoutes();
  }
  @Get('/:route')
  getRouteDataByName(@Param('route') route: string) {
    return this.apiService.getRouteDataByName(route);
  }
  @Delete('/:route/:id')
  deleteObject(@Param('route') route: string, @Param('id') id: number) {
    console.log(route, id);
    const deleteObjectDto: DeleteObjectDto = { name: route, objectId: id };

    return this.apiService.deleteObject(deleteObjectDto);
  }

  @Post('/createRoute')
  createRoute(@Body() createRouteDto: CreateRouteDto, @Request() req) {
    const user = req.user;
    console.log(user);
    return this.apiService.createRoute(createRouteDto, user);
  }
  @Post('/createObject')
  createObject(@Body() createObjectDto: CreateObjectDto) {
    return this.apiService.createObject(createObjectDto);
  }
}
