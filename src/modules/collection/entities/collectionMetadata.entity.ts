import { Entity, Property } from '@mikro-orm/core';
import { BaseEntity } from '../../shared/base.entity';

@Entity({ tableName: 'cms_collections' })
export class CollectionMetadata extends BaseEntity {
  @Property()
  createdBy: number;

  @Property({ name: 'display_name' })
  displayName: string;

  @Property()
  collectionName: string;
}
