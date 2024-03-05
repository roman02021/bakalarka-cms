import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CollectionController } from './collection/collection.controller';
import { CollectionService } from './collection/collection.service';
import { ItemsModule } from './item/item.module';
import { CollectionModule } from './collection/collection.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { FileModule } from './file/file.module';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AttributeModule } from './attribute/attribute.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MikroOrmModule.forRoot(),
    AuthModule,
    ItemsModule,
    CollectionModule,
    UserModule,
    FileModule,
    AttributeModule,
  ],
  controllers: [CollectionController],
  providers: [CollectionService],
})
export class AppModule {}
