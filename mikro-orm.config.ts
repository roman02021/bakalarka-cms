import { Options } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { ConfigService } from '@nestjs/config';

const configService = new ConfigService();
console.log('test', configService, process.env);
const MikroOrmConfig: Options = {
  entities: ['dist/**/*.entity.js'],
  entitiesTs: ['src/**/*.entity.ts', 'src/**/**/*.entity.ts'],
  driver: PostgreSqlDriver,
  dbName: configService.get('DB_NAME'),
  user: configService.get('POSTGRES_USER'),
  password: configService.get('POSTGRES_PASSWORD'),
  host: configService.get('POSTGRES_HOST'),
  port: configService.get('POSTGRES_PORT'),
};

export default MikroOrmConfig;
