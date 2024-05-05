import { Test, TestingModule } from '@nestjs/testing';

import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { AppModule } from '../src/app.module';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { MikroORM } from '@mikro-orm/core';
import { User } from 'src/modules/user/entities/user.entity';
// import { LoginDto } from 'src/modules/auth/dto/login.dto';
// import { RegisterDto } from 'src/modules/auth/dto/reg.dto';

const registerData = {
  name: 'Test Testovsky',
  email: 'testa',
  username: 'test',
  password: 'test',
};

const loginData = {
  username: 'test',
  password: 'test',
};

describe('AuthService', () => {
  let app: INestApplication;
  let orm: MikroORM;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    orm = app.get(MikroORM);
  });

  beforeEach(async () => {
    await orm.getSchemaGenerator().refreshDatabase();
    await orm.getSchemaGenerator().clearDatabase();
  });

  afterAll(async () => {
    await orm.close();
    await app.close();
  });

  it('/POST register', async () => {
    return await request(app.getHttpServer())
      .post('/auth/register')
      .send(registerData)
      .expect('Content-Type', /json/)
      .expect(HttpStatus.CREATED);
  });
  it('/POST login', async () => {
    const res: request.Response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(loginData)
      .expect('Content-Type', /json/)
      .expect(HttpStatus.OK);

    expect(res.body.access_token).toBeDefined();
  });
});
