import {
  Cascade,
  Entity,
  ManyToOne,
  Opt,
  Property,
  Unique,
} from '@mikro-orm/core';
import { BaseEntity } from '../../shared/base.entity';
import {
  IsString,
  IsIn,
  ValidateIf,
  IsNotEmpty,
  IsBoolean,
} from 'class-validator';
import { Collection } from '../../collection/entities/collection.entity';

const TYPES = [
  'text',
  'integer',
  'boolean',
  'decimal',
  'relation',
  'image',
  'file',
];
const RELATIONS = ['oneToOne', 'oneToMany', 'manyToMany'];

@Entity({ tableName: 'cms_attributes' })
@Unique({ properties: ['collection', 'name'] })
export class Attribute extends BaseEntity {
  @IsString()
  @Property()
  displayName: string;

  @IsString()
  @Property()
  name: string;

  @IsIn(TYPES)
  @Property()
  type: string;

  @ManyToOne({ nullable: true, cascade: [Cascade.REMOVE] })
  collection: Collection;

  @IsBoolean()
  isRequired: Opt<boolean> = false;

  @ValidateIf((o) => o.type === `relation`)
  @IsString()
  @IsNotEmpty()
  @IsIn(RELATIONS)
  @Property({ nullable: true })
  relationType: string;

  @ValidateIf((o) => o.type === 'relation')
  @IsString()
  @IsNotEmpty()
  @Property({ nullable: true })
  referencedColumn: string;

  @ValidateIf((o) => o.type === 'relation')
  @IsString()
  @IsNotEmpty()
  @Property({ nullable: true })
  referencedTable: string;

  constructor(
    displayName: string,
    name: string,
    type: string,
    collection: Collection,
    isRequired: boolean,
    relationType: string,
    referencedColumn: string,
    referencedTable: string,
  ) {
    super();
    this.displayName = displayName;
    this.name = name;
    this.type = type;
    this.collection = collection;
    this.isRequired = isRequired;
    this.relationType = relationType;
    this.referencedColumn = referencedColumn;
    this.referencedTable = referencedTable;
  }
}
