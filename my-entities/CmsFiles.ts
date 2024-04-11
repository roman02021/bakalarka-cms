import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { CmsFolders } from './CmsFolders';
import { CmsUsers } from './CmsUsers';

@Entity()
export class CmsFiles {

  @PrimaryKey()
  id!: number;

  @Property({ length: 6 })
  createdAt!: Date;

  @Property({ length: 6 })
  updatedAt!: Date;

  @Property()
  fileSize!: number;

  @Property({ length: 255 })
  relativePath!: string;

  @Property({ length: 255 })
  name!: string;

  @Property({ length: 255 })
  absolutePath!: string;

  @Property({ length: 255 })
  extension!: string;

  @ManyToOne({ entity: () => CmsUsers, updateRule: 'cascade' })
  createdBy!: CmsUsers;

  @ManyToOne({ entity: () => CmsFolders, deleteRule: 'cascade', nullable: true })
  parentFolder?: CmsFolders;

}
