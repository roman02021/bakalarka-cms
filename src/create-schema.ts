// import { MikroORM } from '@mikro-orm/core';
// import { PostgreSqlDriver } from '@mikro-orm/postgresql';
// import { ConfigService } from '@nestjs/config';
// (async () => {
//   const orm = await MikroORM.init({
//     driver: PostgreSqlDriver,
//     dbName: configService.get('DB_NAME'),
//     host: configService.get('DB_HOST'),
//     port: configService.get('DB_PORT'),
//     user: configService.get('DB_USER'),
//     password: configService.get('DB_PASSWORD'),
//     entities: ['dist/**/*.entity.js'],
//     entitiesTs: ['src/**/*.entity.ts', 'src/**/**/*.entity.ts'],
//     metadataProvider: TsMorphMetadataProvider,
//   });
//   const generator = orm.schema;

//   await generator.updateSchema();

//   await orm.close(true);
// })();
