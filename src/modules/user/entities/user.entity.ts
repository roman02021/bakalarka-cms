import { Entity, Property, Unique } from '@mikro-orm/core';
import { BaseEntity } from '../../shared/base.entity';

@Entity({ tableName: 'cms_users' })
@Unique({ properties: ['email'] })
export class User extends BaseEntity {
  @Property()
  name: string;

  @Property()
  username: string;

  @Property({ name: 'email' })
  email: string;

  @Property()
  password: string;
}
