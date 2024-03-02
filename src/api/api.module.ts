import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { Route } from './entities/route.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Route])],
  controllers: [ApiController],
  providers: [ApiService],
})
export class ApiModule {}
