import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

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

  @Property({ length: 255 })
  name!: string;

}
