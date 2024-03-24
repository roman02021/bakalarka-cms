import { OptionalProps, PrimaryKey, Property } from '@mikro-orm/core';

export abstract class BaseEntity {
  [OptionalProps]?: 'createdAt' | 'updatedAt';

  @PrimaryKey()
  id!: number;

  @Property()
  createdAt = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt = new Date();
}
