import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CollectionController } from './modules/collection/collection.controller';
import { CollectionService } from './modules/collection/collection.service';
import { ItemsModule } from './modules/item/item.module';
import { CollectionModule } from './modules/collection/collection.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { FileModule } from './modules/file/file.module';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AttributeModule } from './modules/attribute/attribute.module';

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
