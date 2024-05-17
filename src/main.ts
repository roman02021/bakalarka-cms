import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { MikroORM } from '@mikro-orm/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });

  console.log('yo');

  // await app.get(MikroORM).entityGenerator.generate({
  //   save: true,
  //   bidirectionalRelations: true,
  //   identifiedReferences: true,
  //   esmImport: true,
  //   path: process.cwd() + '/my-entities',
  //   entitySchema: true,
  // });

  // const migrator = app.get(MikroORM).getMigrator().up();
  await app.get(MikroORM).getSchemaGenerator().ensureDatabase();

  await app.get(MikroORM).getSchemaGenerator().updateSchema({
    safe: true,
  });

  // await app.get(MikroORM).schema.

  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors) => new BadRequestException(errors),
      transformOptions: { exposeUnsetFields: false },
    }),
  );

  app.enableShutdownHooks();

  await app.listen(3000);
}
bootstrap();
