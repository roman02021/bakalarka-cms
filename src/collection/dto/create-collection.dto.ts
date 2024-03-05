import { Attribute } from '../../types/attribute';
import { IsNotEmpty, IsString, IsJSON } from 'class-validator';

export class CreateCollectionDto {
  @IsString()
  name: string;
  @IsNotEmpty()
  pluralName: string;
  @IsJSON()
  attributeSchema: Attribute[];
}
