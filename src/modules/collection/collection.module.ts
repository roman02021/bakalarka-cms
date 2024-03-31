import { Module } from '@nestjs/common';
import { CollectionController } from './collection.controller';
import { CollectionService } from './collection.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Collection } from './entities/collection.entity';
import { AttributeService } from '../attribute/attribute.service';

@Module({
  imports: [MikroOrmModule.forFeature([Collection])],
  controllers: [CollectionController],
  providers: [CollectionService, AttributeService],
})
export class CollectionModule {}
