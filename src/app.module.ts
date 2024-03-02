import { Module } from '@nestjs/common';
import { RouterModule } from './router/router.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ApiController } from './api/api.controller';
import { ApiService } from './api/api.service';
import { ItemsModule } from './items/items.module';
import { ApiModule } from './api/api.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { FileModule } from './file/file.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'test_user',
      password: 'test_password',
      database: 'test_db',
      synchronize: true,
      autoLoadEntities: true,
    }),
    AuthModule,
    RouterModule,
    ItemsModule,
    ApiModule,
    UsersModule,
    FileModule,
  ],
  controllers: [ApiController],
  providers: [ApiService],
})
export class AppModule {}
