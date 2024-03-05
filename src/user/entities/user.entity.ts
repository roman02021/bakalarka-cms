import {
  DateType,
  Entity,
  PrimaryKey,
  Property,
  Unique,
} from '@mikro-orm/core';

@Entity()
@Unique({ properties: ['email'] })
export class User {
  @PrimaryKey()
  id: number;

  @Property()
  name: string;

  @Property()
  username: string;

  @Property({ name: 'email' })
  email: string;

  @Property()
  password: string;

  @Property({ name: 'created_at', type: DateType })
  createdAt = new Date();

  @Property({ name: 'updated_at', onUpdate: () => new Date() })
  updatedAt = new Date();
}
