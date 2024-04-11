import { Entity, PrimaryKey, Property, Unique } from '@mikro-orm/core';

@Entity()
export class CmsUsers {

  @PrimaryKey()
  id!: number;

  @Property({ length: 6 })
  createdAt!: Date;

  @Property({ length: 6 })
  updatedAt!: Date;

  @Property({ length: 255 })
  name!: string;

  @Property({ length: 255 })
  username!: string;

  @Unique({ name: 'cms_users_email_unique' })
  @Property({ length: 255 })
  email!: string;

  @Property({ length: 255 })
  password!: string;

}
