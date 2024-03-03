import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/User.entity';
import { MikroOrmModule } from '@mikro-orm/nestjs';

@Module({
  imports: [MikroOrmModule.forFeature([User])],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
