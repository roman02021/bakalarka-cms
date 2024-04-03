import {
  Entity,
  OneToMany,
  Property,
  Collection as OrmCollection,
} from '@mikro-orm/core';
import { BaseEntity } from '../../shared/base.entity';
// import { Attribute } from 'src/types/attribute';
import { Attribute } from '../../attribute/entities/attribute.entity';

@Entity({ tableName: 'cms_collections' })
export class Collection extends BaseEntity {
  @Property()
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
}
