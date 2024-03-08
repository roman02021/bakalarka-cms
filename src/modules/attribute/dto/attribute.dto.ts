import { Type } from 'class-transformer';
import { Attribute } from 'src/types/attribute';

export class CreateAttributesDto {
  @Type(() => Attribute)
  attributes: Attribute[];
}
