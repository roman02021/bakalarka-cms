import { Entity, ManyToOne, Opt, PrimaryKey, Property } from '@mikro-orm/core';
import { CmsFiles } from './CmsFiles';
import { CmsUsers } from './CmsUsers';

@Entity()
export class Blog {

  @PrimaryKey()
  id!: number;

  @ManyToOne({ entity: () => CmsUsers, fieldName: 'created_by', nullable: true })
  createdBy?: CmsUsers;

  @Property({ nullable: true })
  collectionId?: number;

  @Property({ type: 'Date', length: 6, defaultRaw: `CURRENT_TIMESTAMP` })
  createdAt!: Date & Opt;

  @Property({ type: 'Date', length: 6, defaultRaw: `CURRENT_TIMESTAMP` })
  updatedAt!: Date & Opt;

  @Property({ length: 255, nullable: true })
  title?: string;

  @Property({ length: 255, nullable: true })
  text?: string;

  @ManyToOne({ entity: () => CmsFiles, fieldName: 'image', nullable: true })
  image?: CmsFiles;

}
