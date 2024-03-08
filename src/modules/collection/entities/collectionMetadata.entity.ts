import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'cms_collections' })
export class CollectionMetadata {
  @PrimaryKey()
  id: number;

  @Property()
  createdBy: number;

  @Property()
  createdAt = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt = new Date();

  @Property({ name: 'display_name' })
  displayName: string;

  @Property()
  collectionName: string;
}
