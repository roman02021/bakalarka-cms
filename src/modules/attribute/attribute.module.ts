import { Module } from '@nestjs/common';
import { AttributeService } from './attribute.service';
import { AttributeController } from './attribute.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';

@Module({
  imports: [MikroOrmModule.forFeature([])],
  providers: [AttributeService],
  controllers: [AttributeController],
  exports: [AttributeService],
})
export class AttributeModule {}
5;
