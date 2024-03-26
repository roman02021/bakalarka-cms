import {
  Cascade,
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  Property,
} from '@mikro-orm/core';
import { User } from '../../user/entities/user.entity';
import { BaseEntity } from '../../shared/base.entity';
import { File } from './file.entity';

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

  @ManyToOne({ nullable: true, cascade: [Cascade.REMOVE] })
  parentFolder: Folder;

  @OneToMany({
    entity: () => File,
    mappedBy: 'parentFolder',
  })
  files = new Collection<File>(this);

  @OneToMany({
    entity: () => Folder,
    mappedBy: 'parentFolder',
  })
  folders = new Collection<Folder>(this);
}
