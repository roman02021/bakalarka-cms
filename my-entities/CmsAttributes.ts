import { Entity, OneToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { CmsCollections } from './CmsCollections';

@Entity()
export class CmsAttributes {

  @PrimaryKey()
  id!: number;

  @Property({ length: 6 })
  createdAt!: Date;

  @Property({ length: 6 })
  updatedAt!: Date;

  @Property({ length: 255 })
  displayName!: string;

  @Property({ length: 255 })
  name!: string;

  @Property({ length: 255 })
  type!: string;

  @OneToOne({ entity: () => CmsCollections, deleteRule: 'cascade', nullable: true, unique: 'cms_attributes_collection_id_name_unique' })
  collection?: CmsCollections;

  @Property({ length: 255, nullable: true })
  relationType?: string;

  @Property({ length: 255, nullable: true })
  referencedColumn?: string;

  @Property({ length: 255, nullable: true })
  referencedTable?: string;

}
