import { Type } from 'class-transformer';
// import { Attribute } from 'src/types/attribute';
import { Attribute } from '../../attribute/entities/attribute.entity';

export class CreateAttributesDto {
  @Type(() => Attribute)
  attributes: Attribute[];
}
