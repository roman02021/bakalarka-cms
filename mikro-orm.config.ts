import { Options } from '@mikro-orm/core';
import { Migrator } from '@mikro-orm/migrations';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { ConfigService } from '@nestjs/config';
import 'dotenv/config';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';

const configService = new ConfigService();
const MikroOrmConfig: Options = {
  entities: ['dist/**/*.entity.js'],
  entitiesTs: ['src/**/*.entity.ts', 'src/**/**/*.entity.ts'],
  driver: PostgreSqlDriver,
  dbName: configService.get('DB_NAME'),
  user: configService.get('DB_USER'),
  password: configService.get('DB_PASSWORD'),
  host: configService.get('DB_HOST'),
  port: configService.get('DB_PORT'),
  extensions: [Migrator],
  metadataProvider: TsMorphMetadataProvider,
  migrations: {
    disableForeignKeys: false,
  },
};

export default MikroOrmConfig;
