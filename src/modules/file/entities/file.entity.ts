import { Cascade, Entity, ManyToOne, Opt, Property } from '@mikro-orm/core';
import { Folder } from './folder.entity';
import { User } from '../../user/entities/user.entity';
import { BaseEntity } from '../../shared/base.entity';
import { ValidateIf } from 'class-validator';
@Entity({ tableName: 'cms_files' })
export class File extends BaseEntity {
  @Property({ unsigned: true })
  fileSize: number;

  @Property()
  relativePath: Opt<string>;

  @Property()
  @ValidateIf((e) => e !== '')
  filePath: string;

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
    relativePath: string,
    createdBy: User,
    parentFolder: Folder,
    fileSize: number,
  ) {
    super();
    this.name = name;
    this.extension = getExtension(name);
    this.absolutePath = absolutePath;
    this.relativePath = relativePath;
    this.createdBy = createdBy;
    this.parentFolder = parentFolder;
    this.fileSize = fileSize;
    this.filePath = this.relativePath + '/' + this.name;
  }
}

function getExtension(name: string) {
  return name.split('.').pop();
}
