import {
  Entity,
  OneToMany,
  Property,
  Collection as OrmCollection,
  Unique,
} from '@mikro-orm/core';
import { BaseEntity } from '../../shared/base.entity';
import { Attribute } from '../../attribute/entities/attribute.entity';
import { IsString } from 'class-validator';

@Entity({ tableName: 'cms_collections' })
@Unique({ properties: ['name'] })
export class Collection extends BaseEntity {
  @Property()
  createdBy: number;

  @Property()
  displayName: string;

  @Property()
  name: string;

  @OneToMany({
    entity: () => Attribute,
    mappedBy: 'collection',
  })
  attributes = new OrmCollection<Attribute>(this);

  constructor(name: string, displayName: string, createdBy: number) {
    super();
    this.name = name;
    this.displayName = displayName;
    this.createdBy = createdBy;
  }
}
