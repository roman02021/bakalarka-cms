import { Cascade, Entity, ManyToOne, Property } from '@mikro-orm/core';
import { BaseEntity } from '../../shared/base.entity';
import { IsString, IsIn, ValidateIf, IsNotEmpty } from 'class-validator';
import { Collection } from '../../collection/entities/collection.entity';

const TYPES = ['string', 'integer', 'decimal', 'relation'];
const RELATIONS = ['oneToOne', 'oneToMany', 'manyToOne', 'manyToMany'];

@Entity({ tableName: 'cms_attributes' })
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
}
