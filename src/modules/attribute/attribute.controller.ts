import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AttributeService } from './attribute.service';
import { CreateAttributesDto } from './dto/attribute.dto';
import { AuthGuard } from '../auth/auth.guard';
import { Attribute } from './entities/attribute.entity';

@Controller('attribute')
@UseGuards(AuthGuard)
export class AttributeController {
  constructor(private readonly attributeService: AttributeService) {}
  @Post('/:collection')
  createAttributes(
    @Param('collection') collection: string,
    @Body() createAttributesDto: CreateAttributesDto,
  ) {
    console.log(collection, createAttributesDto);
    return this.attributeService.addAttributesToCollection(
      collection,
      createAttributesDto,
    );
  }
  // @Get('/:collectionId')
  // getAttributes(@Param('collectionId') collectionId: number) {
  //   return this.attributeService.getAttributes(collectionId);
  // }
  @Delete('/:collection/:columnName')
  createAttribute(
    @Param('collection') collection: string,
    @Param('columnName') columnName: string,
  ) {
    return this.attributeService.deleteColumn(collection, columnName);
  }
}
