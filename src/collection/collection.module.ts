import { Module } from '@nestjs/common';
import { CollectionController } from './collection.controller';
import { CollectionService } from './collection.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { UserService } from 'src/user/user.service';
import { CollectionMetadata } from './entities/collectionMetadata.entity';

@Module({
  imports: [MikroOrmModule.forFeature([CollectionMetadata])],
  controllers: [CollectionController],
  providers: [CollectionService, UserService],
})
export class CollectionModule {}
