import { Module } from '@nestjs/common';
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
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { ApiModule } from './api/api.module';
import { RelationsService } from './relations/relations.service';
import { EntityGenerator } from '@mikro-orm/entity-generator';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MikroOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        if (configService.get('NODE_ENV') === 'test') {
          console.log(
            configService.get('DB_NAME_TEST'),
            configService.get('NODE_ENV'),
            configService.get('DB_USER_TEST'),
          );
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
            extensions: [EntityGenerator, SeedManager],
            tsNode: false,
          };
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
          extensions: [EntityGenerator],
        };
      },
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
  controllers: [CollectionController],
  providers: [CollectionService, RelationsService],
})
export class AppModule {}

// const config: Options = {
//   driver: PostgreSqlDriver,
//   dbName: 'test_db',
//   host: 'localhost',
//   port: 5432,
//   user: 'test_user',
//   password: 'test_password',
//   entities: ['dist/**/*.entity.js'],
//   entitiesTs: ['src/**/*.entity.ts', 'src/**/**/*.entity.ts'],
//   metadataProvider: TsMorphMetadataProvider,
//   debug: true,
//   schemaGenerator: {
//     disableForeignKeys: true,
//     createForeignKeyConstraints: true,
//     ignoreSchema: [],
//   },
//   extensions: [EntityGenerator],
// };

// export default config;
