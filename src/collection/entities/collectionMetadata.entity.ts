import { DateType, Entity, Opt, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'cms_collection_metadata' })
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
