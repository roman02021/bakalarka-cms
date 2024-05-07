import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { CmsUsers } from './CmsUsers';

@Entity()
export class CmsFolders {

  @PrimaryKey()
  id!: number;

  @Property({ length: 6 })
  createdAt!: Date;

  @Property({ length: 6 })
  updatedAt!: Date;

  @Property({ length: 255 })
  name!: string;

  @ManyToOne({ entity: () => CmsUsers, updateRule: 'cascade' })
  createdBy!: CmsUsers;

  @Property({ length: 255 })
  relativePath!: string;

  @Property({ length: 255 })
  absolutePath!: string;

  @ManyToOne({ entity: () => CmsFolders, updateRule: 'cascade', deleteRule: 'set null', nullable: true })
  parentFolder?: CmsFolders;

}
