import { Entity, ManyToOne, Opt, PrimaryKey, Property } from '@mikro-orm/core';
import { CmsCollections } from './CmsCollections';

@Entity()
export class Author {

  @PrimaryKey()
  id!: number;

  @Property({ nullable: true })
  collectionId?: number;

  @Property({ type: 'Date', length: 6, defaultRaw: `CURRENT_TIMESTAMP` })
  createdAt!: Date & Opt;

  @Property({ type: 'Date', length: 6, defaultRaw: `CURRENT_TIMESTAMP` })
  updatedAt!: Date & Opt;

  @Property({ length: 255, nullable: true })
  name?: string;

  @Property({ nullable: true })
  age?: number;

  @Property()
  redactor!: boolean;

  @ManyToOne({ entity: () => CmsCollections, nullable: true, defaultRaw: `44` })
  article?: CmsCollections;

}
