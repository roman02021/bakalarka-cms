import { Type } from 'class-transformer';
import { Attribute } from '../../types/attribute';
import { IsString, ValidateNested, IsArray } from 'class-validator';

export class CreateCollectionDto {
  @IsString()
  name: string;
  @IsString()
  pluralName: string;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Attribute)
  attributes: Attribute[];
}
