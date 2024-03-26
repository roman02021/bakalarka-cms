import {
  Cascade,
  Entity,
  ManyToOne,
  Opt,
  OptionalProps,
  Property,
} from '@mikro-orm/core';
import { Folder } from './folder.entity';
import { User } from '../../user/entities/user.entity';
import { BaseEntity } from '../../shared/base.entity';
import path from 'path';
@Entity({ tableName: 'cms_files' })
export class File extends BaseEntity {
  @Property({ unsigned: true })
  fileSize: number;

  @Property()
  relativePath: Opt<string>;

  @Property()
  name: string;

  @Property()
  absolutePath: string;

  @Property()
  extension: Opt<string>;

  @ManyToOne(() => User)
  createdBy: User;

  @ManyToOne({ nullable: true, cascade: [Cascade.REMOVE] })
  parentFolder: Folder;

  constructor(
    name: string,
    absolutePath: string,
    createdBy: User,
    parentFolder: Folder,
    fileSize: number,
  ) {
    super();
    this.name = name;
    this.extension = getExtension(name);
    this.absolutePath = absolutePath;
    this.relativePath = absolutePath;
    this.createdBy = createdBy;
    this.parentFolder = parentFolder;
    this.fileSize = fileSize;
  }
}

function getExtension(name: string) {
  return name.split('.').pop();
}
