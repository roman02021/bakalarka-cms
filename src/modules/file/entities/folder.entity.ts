import {
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { User } from '../../user/entities/user.entity';

@Entity({ tableName: 'cms_folders' })
export class Folder {
  @PrimaryKey()
  id: number;

  @Property()
  name: string;

  @ManyToOne(() => User)
  createdBy: User;

  @Property()
  relativePath: string;

  @Property()
  absolutePath: string;

  @OneToOne()
  parentFolder: Folder;
}
