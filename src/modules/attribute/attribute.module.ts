import { Module } from '@nestjs/common';
import { AttributeService } from './attribute.service';
import { AttributeController } from './attribute.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { RelationsService } from 'src/relations/relations.service';

@Module({
  imports: [MikroOrmModule.forFeature([])],
  providers: [AttributeService, RelationsService],
  controllers: [AttributeController],
  exports: [AttributeService],
})
export class AttributeModule {}
5;
