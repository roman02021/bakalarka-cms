import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CreateRouteDto } from './dto/create-route.dto';
import { ApiService } from './api.service';
import { CreateObjectDto } from './dto/create-object.dto';
import { AuthGuard } from 'src/auth/auth.guard';

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

  @Post('/createRoute')
  createRoute(@Body() createRouteDto: CreateRouteDto) {
    return this.apiService.createRoute(createRouteDto);
  }
  @Post('/createObject')
  createObject(@Body() createObjectDto: CreateObjectDto) {
    return this.apiService.createObject(createObjectDto);
  }
}
