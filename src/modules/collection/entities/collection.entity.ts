import { Entity, Property } from '@mikro-orm/core';
import { BaseEntity } from '../../shared/base.entity';
import { Attribute } from 'src/types/attribute';

class Schema {
  attributes: Attribute[];
}

@Entity({ tableName: 'cms_collections' })
export class Collection extends BaseEntity {
  @Property()
  createdBy: number;

  @Property({ name: 'display_name' })
  displayName: string;

  @Property()
  name: string;
}
