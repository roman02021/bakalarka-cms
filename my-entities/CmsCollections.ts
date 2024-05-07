import { Entity, PrimaryKey, Property, Unique } from '@mikro-orm/core';

@Entity()
export class CmsCollections {

  @PrimaryKey()
  id!: number;

  @Property({ length: 6 })
  createdAt!: Date;

  @Property({ length: 6 })
  updatedAt!: Date;

  @Property()
  createdBy!: number;

  @Property({ length: 255 })
  displayName!: string;

  @Unique({ name: 'cms_collections_name_unique' })
  @Property({ length: 255 })
  name!: string;

}
