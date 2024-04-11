import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { User } from '../user/entities/User.entity';
import { CreateFolderDto } from './dto/create-folder.dto';
import { mkdirSync } from 'fs';
import { Folder } from './entities/folder.entity';
import { File } from './entities/file.entity';
import * as fs from 'fs';
import * as path from 'path';
import { UpdateFolderDto } from './dto/update-folder.dto';

@Injectable()
export class FileService {
  constructor(private em: EntityManager) {}

  async saveFile(
    file: Express.Multer.File,
    user: User,
    folderId: number | null,
  ) {
    try {
      //just update the fileSize if file with same name in same folder exists
      const fileWithSameName = await this.em.findOne(File, {
        name: file.originalname,
        parentFolder: folderId,
      });

      if (fileWithSameName) {
        fileWithSameName.fileSize = file.size;

        this.em.flush();

        fs.writeFileSync(fileWithSameName.absolutePath, file.buffer);

        return 'File overwritten';
      }

      file.originalname = `${file.originalname}`;

      const paths = await this.getPath(folderId, file.originalname);

      const currentUser = await this.em.findOne(User, user.id);

      const newFile = this.em.create(File, {
        absolutePath: paths.absolutePath,
        relativePath: paths.relativePath,
        name: file.originalname,
        fileSize: file.size,
        parentFolder: folderId,
        createdBy: currentUser,
      });
      const insertedFile = await this.em.insert(File, newFile);

      fs.writeFileSync(paths.absolutePath, file.buffer);

      this.em.flush();

      return insertedFile;
    } catch (error) {
      throw new HttpException(error, HttpStatus.CONFLICT);
    }
  }
  async createFolder(createFolderDto: CreateFolderDto, user: User) {
    try {
      const folderWithSameName = await this.em.findOne(Folder, {
        name: createFolderDto.name,
        parentFolder: createFolderDto.parentFolder,
      });

      if (folderWithSameName) {
        throw new HttpException('Folder already exists', HttpStatus.CONFLICT);
      }

      const paths = await this.getPath(
        createFolderDto.parentFolder,
        createFolderDto.name,
      );

      const newFolder = this.em.create(Folder, {
        absolutePath: paths.absolutePath,
        relativePath: paths.relativePath,
        name: createFolderDto.name,
        parentFolder: createFolderDto.parentFolder,
        createdBy: user.id,
      });
      const insertedFolder = await this.em.insert(Folder, newFolder);
      mkdirSync(paths.absolutePath);
      return insertedFolder;
    } catch (error) {
      if (error.name === 'ForeignKeyConstraintViolationException') {
        throw new HttpException(
          'Parent folder does not exist',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(error, HttpStatus.CONFLICT);
    }
  }
  async synchronizeVirtualFiles() {
    return 'TODO';
  }

  async getFilesInRootFolder() {
    const files = await this.em.findAll(File, {
      where: {
        parentFolder: null,
      },
    });
    const folders = await this.em.findAll(Folder, {
      where: {
        parentFolder: null,
      },
    });
    const response = {
      files: [...files],
      folders: [...folders],
    };
    return response;
  }
  async getFilesInFolder(folderId: number) {
    const files = await this.em.findAll(File, {
      where: {
        parentFolder: folderId,
      },
    });
    const folders = await this.em.findAll(Folder, {
      where: {
        parentFolder: folderId,
      },
    });
    const response = {
      files: [...files],
      folders: [...folders],
    };
    return response;
  }

  async updateFolder(updateFolderDto: UpdateFolderDto, folderId: number) {
    try {
      //1. get folder you want to move
      const folderToMove = await this.em.findOneOrFail(Folder, folderId);

      //2. get folder you want to move to if move to root, just set the parent to null
      if (updateFolderDto.newParentFolder === null) {
        folderToMove.parentFolder = null;
      } else {
        const newParentFolder = await this.em.findOneOrFail(
          Folder,
          updateFolderDto.newParentFolder,
          { populate: ['files'] },
        );
        folderToMove.parentFolder = newParentFolder;
      }

      //3. get updated path of the root folder
      const paths = await this.getPath(
        updateFolderDto.newParentFolder,
        updateFolderDto.newName ? updateFolderDto.newName : folderToMove.name,
      );

      //4. physically move the folder with it's content to new location
      fs.renameSync(folderToMove.absolutePath, paths.absolutePath);

      //5. set new virtual path of the moved folder
      folderToMove.absolutePath = paths.absolutePath;
      folderToMove.relativePath = paths.relativePath;

      //6. set new virtual paths of files in root of the moved folder
      const rootFiles = await folderToMove.files.loadItems();
      for (const rootFile of rootFiles) {
        rootFile.absolutePath = paths.absolutePath;
        rootFile.relativePath = paths.relativePath;
      }

      //7. get all the nested folders inside of the moved folder
      const nestedFolders = await this.getNestedFolders(folderToMove.id);

      //8. loop over nested folders and set their paths
      for (const nestedFolder of nestedFolders) {
        const folder = await this.em.findOneOrFail(Folder, nestedFolder.id, {
          populate: ['files'],
        });

        const paths = await this.getPath(folder.id, '');
        folder.absolutePath = paths.absolutePath;
        folder.relativePath = paths.relativePath;

        //9. loop over nested files and set their paths
        for (const nestedFile of await folder.files.loadItems()) {
          nestedFile.absolutePath = paths.absolutePath;
          nestedFile.relativePath = paths.relativePath;
        }
      }
      //10. set the folder name to new name
      if (updateFolderDto?.newName && !nestedFolders.length) {
        folderToMove.name = updateFolderDto.newName;
      }
      //11. save
      this.em.flush();
      return folderToMove;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async updateFile(updateFolderDto: UpdateFolderDto, fileId: number) {
    try {
      const file = await this.em.findOneOrFail(File, fileId);
      const fileName = updateFolderDto.newName
        ? `${updateFolderDto.newName}.${file.extension}`
        : file.name;

      if (updateFolderDto.newParentFolder === null) {
        file.parentFolder = null;
        const paths = await this.getPath(null, fileName);
        fs.renameSync(file.absolutePath, `${paths.absolutePath}`);
        file.parentFolder = null;
        file.absolutePath = paths.absolutePath;
        if (updateFolderDto?.newName) {
          file.name = updateFolderDto.newName;
        }
      } else if (updateFolderDto.newParentFolder) {
        const newParentFolder = await this.em.findOneOrFail(
          Folder,
          updateFolderDto.newParentFolder,
        );
        const paths = await this.getPath(
          updateFolderDto.newParentFolder,
          fileName,
        );
        fs.renameSync(file.absolutePath, paths.absolutePath);
        file.absolutePath = paths.absolutePath;
        file.parentFolder = newParentFolder;
        if (updateFolderDto?.newName) {
          file.name = updateFolderDto.newName;
        }
      }

      this.em.flush();
      return file;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async deleteFolder(folderId: number) {
    try {
      const folder = await this.em.findOneOrFail(Folder, folderId);
      fs.rmSync(folder.absolutePath, { recursive: true });

      await this.em.removeAndFlush(folder);
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async deleteFile(fileId: number) {
    try {
      const file = await this.em.findOneOrFail(File, fileId);
      fs.rmSync(file.absolutePath);
      this.em.removeAndFlush(file);
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async getNestedFolders(folderId: number) {
    const knex = this.em.getKnex();

    const nestedFolders = await knex
      .withRecursive('folder_tree', (qb) => {
        qb.select(
          'cms_folders.name',
          'cms_folders.parent_folder_id',
          'cms_folders.id',
          'cms_folders.absolute_path',
        )
          .from('cms_folders')
          .where('cms_folders.parent_folder_id', folderId)
          .unionAll((qb) => {
            qb.select(
              'cms_folders.name',
              'cms_folders.parent_folder_id',
              'cms_folders.id',
              'cms_folders.absolute_path',
            )
              .from('cms_folders')
              .join(
                'folder_tree',
                'folder_tree.id',
                'cms_folders.parent_folder_id',
              );
          });
      })
      .select('*')
      .from('folder_tree');

    return nestedFolders;
  }
  async getPath(
    folderId: number | null,
    name: string,
  ): Promise<{
    relativePath: string;
    absolutePath: string;
  }> {
    let absolutePath = path.join(process.cwd(), 'files');
    let relativePath = '';
    if (folderId) {
      const knex = this.em.getKnex();
      const result = await knex
        .withRecursive('ancestors', (qb) => {
          qb.select('cms_folders.name', 'cms_folders.parent_folder_id')
            .from('cms_folders')
            .where('cms_folders.id', folderId)
            .unionAll((qb) => {
              qb.select('cms_folders.name', 'cms_folders.parent_folder_id')
                .from('cms_folders')
                .join(
                  'ancestors',
                  'ancestors.parent_folder_id',
                  'cms_folders.id',
                );
            });
        })
        .select('*')
        .from('ancestors');

      relativePath = result
        .reverse()
        .reduce((acc, currentValue) => acc + `/${currentValue.name}`, ``);
      absolutePath = path.join(absolutePath, relativePath, name);
    } else {
      absolutePath = path.join(absolutePath, name);
    }
    return {
      absolutePath,
      relativePath,
    };
  }
}
