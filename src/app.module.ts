import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApiController } from './api/api.controller';
import { ApiService } from './api/api.service';
import { ItemsModule } from './items/items.module';
import { ApiModule } from './api/api.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { FileModule } from './file/file.module';
import { MikroOrmModule } from '@mikro-orm/nestjs';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MikroOrmModule.forRoot(),
    AuthModule,
    ItemsModule,
    ApiModule,
    UsersModule,
    FileModule,
  ],
  controllers: [ApiController],
  providers: [ApiService],
})
export class AppModule {}
