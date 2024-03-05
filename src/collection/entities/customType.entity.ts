import { DateType, Entity, PrimaryKey, Property } from '@mikro-orm/core';

import { Attribute } from '../types/attribute';

@Entity({ tableName: 'custom_types' })
export class CustomType {
  @PrimaryKey()
  id: number;

  @Property({ name: 'route_id' })
  routeId: number;

  @Property({ name: 'created_by' })
  createdBy: number;

  @Property({ name: 'number' })
  changedBy: number;

  @Property({ name: 'created_at', type: DateType })
  createdAt = new Date();

  @Property({ name: 'updated_at', onUpdate: () => new Date() })
  updatedAt = new Date();

  @Property({ type: 'json' })
  jsonSchema: Attribute[];
}
