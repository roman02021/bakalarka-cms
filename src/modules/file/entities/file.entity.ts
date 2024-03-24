import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { Folder } from './folder.entity';
import { User } from '../../user/entities/user.entity';
import { BaseEntity } from '../../shared/base.entity';
@Entity({ tableName: 'cms_files' })
export class File extends BaseEntity {
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

  @ManyToOne({ nullable: true })
  parentFolder?: Folder;
}
