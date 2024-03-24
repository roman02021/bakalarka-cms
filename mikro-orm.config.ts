import { Options } from '@mikro-orm/core';
import { EntityGenerator } from '@mikro-orm/entity-generator';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';

const config: Options = {
  driver: PostgreSqlDriver,
  dbName: 'test_db',
  host: 'localhost',
  port: 5432,
  user: 'test_user',
  password: 'test_password',
  entities: ['dist/**/*.entity.js'],
  entitiesTs: ['src/**/*.entity.ts', 'src/**/**/*.entity.ts'],
  metadataProvider: TsMorphMetadataProvider,
  debug: true,
  schemaGenerator: {
    disableForeignKeys: true,
    createForeignKeyConstraints: true,
    ignoreSchema: [],
  },
  extensions: [EntityGenerator],
};

export default config;
