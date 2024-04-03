import { Type } from 'class-transformer';
// import { Attribute } from '../../../types/attribute';
import { IsString, ValidateNested, IsArray } from 'class-validator';
import { Attribute } from '../../attribute/entities/attribute.entity';

export class CreateCollectionDto {
  @IsString()
  name: string;
  @IsString()
  displayName: string;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Attribute)
  attributes: Attribute[];
}
