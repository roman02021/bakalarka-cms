import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { User } from '../user/entities/User.entity';
import { UploadFileDto } from './dto/upload-file.dto';
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
      console.log(fileWithSameName, folderId, file);

      if (fileWithSameName) {
        fileWithSameName.fileSize = file.size;

        this.em.flush();

        fs.writeFileSync(fileWithSameName.absolutePath, file.buffer);

        return 'File overwritten';
      }

      file.originalname = `${file.originalname}`;

      const absolutePath = await this.getAbsolutePath(
        folderId,
        file.originalname,
      );

      console.log(absolutePath, 'PATH');

      const currentUser = await this.em.findOne(User, user.id);

      const newFile = this.em.create(File, {
        absolutePath: absolutePath,
        relativePath: absolutePath,
        name: file.originalname,
        fileSize: file.size,
        parentFolder: folderId,
        createdBy: currentUser,
      });
      const insertedFile = await this.em.insert(File, newFile);

      fs.writeFileSync(absolutePath, file.buffer);

      this.em.flush();

      return insertedFile;
    } catch (error) {
      console.log(error);
      throw new HttpException(error, HttpStatus.CONFLICT);
    }
  }
  async createFolder(createFolderDto: CreateFolderDto, user: User) {
    try {
      const folderWithSameName = await this.em.findOne(Folder, {
        name: createFolderDto.name,
        parentFolder: createFolderDto.parentFolder,
      });

      console.log(folderWithSameName);

      if (folderWithSameName) {
        throw new HttpException('Folder already exists', HttpStatus.CONFLICT);
      }

      const absolutePath = await this.getAbsolutePath(
        createFolderDto.parentFolder,
        createFolderDto.name,
      );

      const newFolder = this.em.create(Folder, {
        absolutePath: absolutePath,
        relativePath: absolutePath,
        name: createFolderDto.name,
        parentFolder: createFolderDto.parentFolder,
        createdBy: user.id,
      });
      const insertedFolder = await this.em.insert(Folder, newFolder);

      mkdirSync(absolutePath);
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
  async getAbsolutePath(folderId: number | null, name: string) {
    let absolutePath = path.join(process.cwd(), 'files');
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

      const relativePath = result
        .reverse()
        .reduce((acc, currentValue) => acc + `/${currentValue.name}`, ``);
      absolutePath = path.join(absolutePath, relativePath, name);
    } else {
      absolutePath = path.join(absolutePath, name);
    }
    return absolutePath;
  }

  async updateFolder(updateFolderDto: UpdateFolderDto, folderId: number) {
    try {
      const folder = await this.em.findOneOrFail(Folder, folderId);
      const knex = this.em.getKnex();

      // console.log(folderId);

      // folder.name = updateFolderDto.newName;

      if (updateFolderDto.newParentFolder === null) {
        folder.parentFolder = null;
        const absolutePath = await this.getAbsolutePath(null, folder.name);
        fs.renameSync(folder.absolutePath, `${absolutePath}`);
        folder.parentFolder = null;
        folder.absolutePath = absolutePath;
        if (updateFolderDto?.newName) {
          folder.name = updateFolderDto.newName;
        }
      } else if (updateFolderDto.newParentFolder) {
        const newParentFolder = await this.em.findOneOrFail(
          Folder,
          updateFolderDto.newParentFolder,
        );
        const absolutePath = await this.getAbsolutePath(
          updateFolderDto.newParentFolder,
          updateFolderDto.newName ? updateFolderDto.newName : folder.name,
        );
        console.log(absolutePath, 'MMMM');
        fs.renameSync(folder.absolutePath, absolutePath);
        folder.absolutePath = absolutePath;
        folder.parentFolder = newParentFolder;
        const nestedFoolders = await knex
          .withRecursive('folder_tree', (qb) => {
            qb.select(
              'cms_folders.name',
              'cms_folders.parent_folder_id',
              'cms_folders.id',
              'cms_folders.absolute_path',
            )
              .from('cms_folders')
              .where('cms_folders.id', folderId)
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

        console.log(nestedFoolders, 'yoo');

        const rootFolder = await this.em.findOneOrFail(Folder, folderId);

        rootFolder.absolutePath = await this.getAbsolutePath(
          updateFolderDto.newParentFolder,
          updateFolderDto.newName ? updateFolderDto.newName : rootFolder.name,
        );

        let isFirstLevel = true;

        for (const nestedFolder of nestedFoolders) {
          const folder = await this.em.findOneOrFail(Folder, nestedFolder.id, {
            populate: ['files'],
          });
          for (const test of await folder.files.loadItems()) {
            console.log(test, 'giga');
          }
          folder.absolutePath = await this.getAbsolutePath(
            isFirstLevel ? rootFolder.id : folder.id,
            folder.name,
          );

          console.log(folder.absolutePath, 'new path');

          // const filesInFolder = folder.files.getItems();

          // console.log(filesInFolder);

          // for (const fileInFolder of filesInFolder) {
          //   fileInFolder.absolutePath = await this.getAbsolutePath(
          //     fileInFolder.id,
          //     fileInFolder.name,
          //   );

          //   console.log(fileInFolder, 'test');
          // }
          // isFirstLevel = false;
        }
        if (updateFolderDto?.newName && !nestedFoolders.length) {
          folder.name = updateFolderDto.newName;
        }
      }

      this.em.flush();
      return folder;
    } catch (error) {
      console.log(error);
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async updateFile(updateFolderDto: UpdateFolderDto, fileId: number) {
    try {
      const file = await this.em.findOneOrFail(File, fileId);
      console.log(file);
      const fileName = updateFolderDto.newName
        ? `${updateFolderDto.newName}.${file.extension}`
        : file.name;

      if (updateFolderDto.newParentFolder === null) {
        file.parentFolder = null;
        const absolutePath = await this.getAbsolutePath(null, fileName);
        fs.renameSync(file.absolutePath, `${absolutePath}`);
        file.parentFolder = null;
        file.absolutePath = absolutePath;
        if (updateFolderDto?.newName) {
          file.name = updateFolderDto.newName;
        }
      } else if (updateFolderDto.newParentFolder) {
        const newParentFolder = await this.em.findOneOrFail(
          Folder,
          updateFolderDto.newParentFolder,
        );
        const absolutePath = await this.getAbsolutePath(
          updateFolderDto.newParentFolder,
          fileName,
        );
        fs.renameSync(file.absolutePath, absolutePath);
        file.absolutePath = absolutePath;
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
      console.log(error);
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async deleteFile(fileId: number) {
    try {
      const file = await this.em.findOneOrFail(File, fileId);
      fs.rmSync(file.absolutePath);
      this.em.removeAndFlush(file);
    } catch (error) {
      console.log(error);
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}

//this can get all children folders from folderId parent

// const childrenFiles = await folder.files.loadItems();
// for (const childrenFile of childrenFiles) {
//   await this.em.removeAndFlush(childrenFile);
// }
// const knex = this.em.getKnex();

// console.log(folderId);

// const result = await knex
//   .withRecursive('folder_tree', (qb) => {
//     qb.select(
//       'cms_folders.name',
//       'cms_folders.parent_folder_id',
//       'cms_folders.id',
//     )
//       .from('cms_folders')
//       .where('cms_folders.id', folderId)
//       .unionAll((qb) => {
//         qb.select(
//           'cms_folders.name',
//           'cms_folders.parent_folder_id',
//           'cms_folders.id',
//         )
//           .from('cms_folders')
//           .join(
//             'folder_tree',
//             'folder_tree.id',
//             'cms_folders.parent_folder_id',
//           );
//       });
//   })
//   .select('*')
//   .from('folder_tree');

// // const filos = await knex
// //   .select('*')
// //   .from('folder_tree')
// //   .join('cms_files', 'cms_files.parent_folder_id', 'folder_tree.id');

// console.log(result);
// // const childrenFolders = await folder.folders.loadItems();
// // for (const childrenFolder of childrenFolders) {

// // }
