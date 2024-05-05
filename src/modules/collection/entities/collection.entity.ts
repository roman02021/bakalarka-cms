import {
  Entity,
  OneToMany,
  Property,
  Collection as OrmCollection,
  Unique,
} from '@mikro-orm/core';
import { BaseEntity } from '../../shared/base.entity';
// import { Attribute } from 'src/types/attribute';
import { Attribute } from '../../attribute/entities/attribute.entity';

@Entity({ tableName: 'cms_collections' })
@Unique({ properties: ['name'] })
export class Collection extends BaseEntity {
  @Property({ name: 'created_by' })
  createdBy: number;

  @Property({ name: 'display_name' })
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
