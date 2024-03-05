import { Module } from '@nestjs/common';
import { CollectionController } from './collection.controller';
import { CollectionService } from './collection.service';
import { Route } from './entities/route.entity';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { UserService } from 'src/user/user.service';

@Module({
  imports: [MikroOrmModule.forFeature([Route])],
  controllers: [CollectionController],
  providers: [CollectionService, UserService],
})
export class CollectionModule {}
