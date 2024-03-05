import { Module } from '@nestjs/common';
import { CollectionController } from './collection.controller';
import { CollectionService } from './collection.service';
import { Route } from './entities/route.entity';
import { MikroOrmModule } from '@mikro-orm/nestjs';

@Module({
  imports: [MikroOrmModule.forFeature([Route])],
  controllers: [CollectionController],
  providers: [CollectionService],
})
export class CollectionModule {}
