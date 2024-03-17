import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Folder } from './folder.entity';
import { User } from '../../user/entities/user.entity';

@Entity({ tableName: 'cms_files' })
export class File {
  @PrimaryKey()
  id: number;

  @Property({ unsigned: true })
  fileSize: number;

  @Property()
  relativePath: string;

  @Property()
  fileName: string;

  @Property()
  absolutePath: string;

  @ManyToOne(() => User)
  createdBy: User;

  @ManyToOne(() => Folder, { nullable: true })
  parentFolder?: Folder;
}
