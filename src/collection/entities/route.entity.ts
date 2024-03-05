import {
  DateType,
  Entity,
  Opt,
  PrimaryKey,
  Property,
  Unique,
} from '@mikro-orm/core';

import { Attribute } from '../types/attribute';
import { JSONSchemaType } from 'ajv';
import { SomeJSONSchema } from 'ajv/dist/types/json-schema';

@Entity({ tableName: 'routes' })
@Unique({ properties: ['name', 'pluralName'] })
export class Route {
  @PrimaryKey()
  id: number;

  @Property({ name: 'name' })
  name: string;

  @Property({ name: 'plural_name' })
  pluralName: string;

  @Property({ name: 'created_by' })
  createdBy: number;

  @Property({ name: 'amount_of_objects' })
  amountOfObjects: number & Opt = 1;

  @Property({ name: 'number' })
  changedBy: number;

  @Property({ name: 'created_at', type: DateType })
  createdAt = new Date();

  @Property({ name: 'updated_at', onUpdate: () => new Date() })
  updatedAt = new Date();

  @Property({ type: 'json' })
  attributeSchema: SomeJSONSchema;
}
