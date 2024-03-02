import {
  Entity,
  PrimaryKey,
  Property,
  TimeType,
  Unique,
} from '@mikro-orm/core';
import { Attribute } from '../api/types/attribute';

@Entity({ tableName: 'routes2' })
@Unique({ properties: ['pluralName'] })
export class Route {
  @PrimaryKey()
  id: number;

  @Property({ name: 'name' })
  name: string;

  @Property({ name: 'plural_name' })
  pluralName: string;

  @Property({ name: 'created_by' })
  createdBy: number;

  @Property({ name: 'number' })
  changedBy: number;

  @Property({ type: TimeType, nullable: true })
  createdAt: Date;

  @Property({ type: TimeType, nullable: true })
  updatedAt: Date;

  @Property({ type: 'json' })
  attributes: Attribute[];
}
