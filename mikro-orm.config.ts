import { Options, ReflectMetadataProvider } from '@mikro-orm/core';
import { EntityGenerator } from '@mikro-orm/entity-generator';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';

const config: Options = {
  driver: PostgreSqlDriver,
  dbName: 'test_db',
  host: 'localhost',
  port: 5432,
  user: 'test_user',
  password: 'test_password',
  entities: ['dist/**/*.entity.js'],
  entitiesTs: ['src/**/*.entity.ts'],
  metadataProvider: ReflectMetadataProvider,
  debug: true,
  schemaGenerator: {
    disableForeignKeys: true,
    createForeignKeyConstraints: true,
    ignoreSchema: [],
  },
  extensions: [EntityGenerator],
};

export default config;
