import { Entity, ManyToOne, OneToOne, Property } from '@mikro-orm/core';
import { User } from '../../user/entities/user.entity';
import { BaseEntity } from '../../shared/base.entity';

@Entity({ tableName: 'cms_folders' })
export class Folder extends BaseEntity {
  @Property()
  name: string;

  @ManyToOne(() => User)
  createdBy: User;

  @Property()
  relativePath: string;

  @Property()
  absolutePath: string;

  @ManyToOne({ nullable: true })
  parentFolder: Folder;
}
