import { Module, OnApplicationBootstrap, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CollectionController } from './modules/collection/collection.controller';
import { CollectionService } from './modules/collection/collection.service';
import { ItemsModule } from './modules/item/item.module';
import { CollectionModule } from './modules/collection/collection.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { FileModule } from './modules/file/file.module';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AttributeModule } from './modules/attribute/attribute.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { SeedManager } from '@mikro-orm/seeder';

// import { Options } from '@mikro-orm/core';
// import { EntityGenerator } from '@mikro-orm/entity-generator';
import {
  MikroORM,
  PostgreSqlDriver,
  SchemaGenerator,
} from '@mikro-orm/postgresql';
import { Migrator } from '@mikro-orm/migrations';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { ApiModule } from './modules/api/api.module';
import { RelationsService } from './relations/relations.service';
import { EntityGenerator } from '@mikro-orm/entity-generator';
import { UserController } from './modules/user/user.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MikroOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        if (configService.get('NODE_ENV') === 'test') {
          return {
            driver: PostgreSqlDriver,
            dbName: configService.get('DB_NAME_TEST'),
            host: configService.get('DB_HOST_TEST'),
            port: configService.get('DB_PORT_TEST'),
            user: configService.get('DB_USER_TEST'),
            password: configService.get('DB_PASSWORD_TEST'),
            entities: ['dist/**/*.entity.js'],
            entitiesTs: ['src/**/*.entity.ts', 'src/**/**/*.entity.ts'],
            metadataProvider: TsMorphMetadataProvider,
            extensions: [EntityGenerator, SeedManager, Migrator],
            tsNode: false,
          };
        } else if (configService.get('NODE_ENV') === 'prod') {
        } else {
        }
        return {
          driver: PostgreSqlDriver,
          dbName: configService.get('DB_NAME'),
          host: configService.get('DB_HOST'),
          port: configService.get('DB_PORT'),
          user: configService.get('DB_USER'),
          password: configService.get('DB_PASSWORD'),
          entities: ['dist/**/*.entity.js'],
          entitiesTs: ['src/**/*.entity.ts', 'src/**/**/*.entity.ts'],
          metadataProvider: TsMorphMetadataProvider,
          extensions: [EntityGenerator, SchemaGenerator, Migrator],
        };
      },
      inject: [ConfigService],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../../files'),
      serveRoot: '/files',
      serveStaticOptions: { index: false },
    }),
    AuthModule,
    ItemsModule,
    CollectionModule,
    UserModule,
    FileModule,
    AttributeModule,
    ApiModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
