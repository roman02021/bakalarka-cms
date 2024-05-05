import { ConfigModule, ConfigService } from '@nestjs/config';

import { INestApplication, Module } from '@nestjs/common';
import { MikroOrmModule, getRepositoryToken } from '@mikro-orm/nestjs';
import { MikroORM, PostgreSqlDriver } from '@mikro-orm/postgresql';
import { User } from './entities/user.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { UserService } from './user.service';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';

describe('UserService', () => {
  let userService: UserService;
  let orm: MikroORM;

  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        MikroOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            driver: PostgreSqlDriver,
            dbName: configService.get('DB_NAME_TEST'),
            host: configService.get('DB_HOST_TEST'),
            port: configService.get('DB_PORT_TEST'),
            user: configService.get('DB_USER_TEST'),
            password: configService.get('DB_PASSWORD_TEST'),
            entities: ['dist/**/*.entity.js'],
            entitiesTs: ['src/**/*.entity.ts', 'src/**/**/*.entity.ts'],
          }),
        }),
      ],
      providers: [UserService, ConfigService],
    }).compile();
    console.log(module);

    userService = module.get<UserService>(UserService);
    orm = module.get<MikroORM>(MikroORM);
  });

  it('finds users', async () => {
    orm.em.fork();
    const res = await userService.findOne('abc');
    console.log(res);
  });
});
