import { Entity, Property, Unique } from '@mikro-orm/core';
import { BaseEntity } from '../../shared/base.entity';
import { IsEmail } from 'class-validator';
import * as bcrypt from 'bcrypt';

@Entity({ tableName: 'cms_users' })
@Unique({ properties: ['email'] })
export class User extends BaseEntity {
  @Property()
  name: string;

  @Property()
  username: string;

  @Property()
  @IsEmail()
  email: string;

  @Property()
  password: string;

  constructor(name: string, username: string, email: string, password: string) {
    super();
    this.name = name;
    this.username = username;
    this.email = email;
    this.password = bcrypt.hashSync(password, 10);
  }
}
