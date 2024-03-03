import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { Route } from './entities/route.entity';
import { MikroOrmModule } from '@mikro-orm/nestjs';

@Module({
  imports: [MikroOrmModule.forFeature([Route])],
  controllers: [ApiController],
  providers: [ApiService],
})
export class ApiModule {}
