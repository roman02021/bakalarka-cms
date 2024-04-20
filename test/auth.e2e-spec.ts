import { Test, TestingModule } from '@nestjs/testing';

import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AuthModule } from '../src/modules/auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MikroOrmModule, getEntityManagerToken } from '@mikro-orm/nestjs';
import {
  EntityManager,
  MikroORM,
  PostgreSqlDriver,
} from '@mikro-orm/postgresql';
import { AppModule } from '../src/app.module';

describe('AuthService', () => {
  let app: INestApplication;
  let orm: EntityManager;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.get(MikroORM).getSchemaGenerator().updateSchema();
    await app.init();
  });

  it('/POST register', async () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'testABACUS',
        email: 'testa',
        username: 'test',
        password: 'test',
      })
      .expect('Content-Type', /json/)
      .expect(201);
  });
});
