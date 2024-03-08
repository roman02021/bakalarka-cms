import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entities/User.entity';
import { MikroOrmModule } from '@mikro-orm/nestjs';

@Module({
  imports: [MikroOrmModule.forFeature([User])],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
