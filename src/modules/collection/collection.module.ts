import { Module } from '@nestjs/common';
import { CollectionController } from './collection.controller';
import { CollectionService } from './collection.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Collection } from './entities/collection.entity';
import { AttributeModule } from '../attribute/attribute.module';

@Module({
  imports: [MikroOrmModule.forFeature([Collection]), AttributeModule],
  controllers: [CollectionController],
  providers: [CollectionService],
})
export class CollectionModule {}
