import { Entity } from '@mikro-orm/core';
import { BaseEntity } from '../../shared/base.entity';
import {
  IsString,
  IsIn,
  IsOptional,
  ValidateIf,
  IsNotEmpty,
} from 'class-validator';

const TYPES = ['string', 'integer', 'decimal', 'relation'];
const RELATIONS = ['oneToOne', 'oneToMany', 'manyToOne', 'manyToMany'];

@Entity({ tableName: 'cms_attributes' })
export class Attribute extends BaseEntity {
  @IsString()
  displayName: string;

  @IsString()
  name: string;

  @IsIn(TYPES)
  type: string;

  @ValidateIf((o) => o.type === 'relation')
  @IsString()
  @IsNotEmpty()
  @IsIn(RELATIONS)
  relationType: string;

  @ValidateIf((o) => o.type === 'relation')
  @IsString()
  @IsNotEmpty()
  referencedColumn: string;

  @ValidateIf((o) => o.type === 'relation')
  @IsString()
  @IsNotEmpty()
  referencedTable: string;
}
