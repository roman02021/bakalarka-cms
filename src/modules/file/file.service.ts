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
    uploadFileDto: UploadFileDto,
  ) {
    try {
      //just update the fileSize if file with same name in same folder exists
      const fileWithSameName = await this.em.findOne(File, {
        fileName: file.originalname,
        parentFolder: uploadFileDto.data.folderId,
      });
      if (fileWithSameName) {
        fileWithSameName.fileSize = file.size;
        this.em.flush();

        fs.writeFileSync(fileWithSameName.absolutePath, file.buffer);

        return 'File overwritten';
      }

      file.originalname = `${file.originalname}`;

      const absolutePath = await this.getAbsolutePath(
        uploadFileDto.data.folderId,
        file.originalname,
      );

      const currentUser = await this.em.findOne(User, user.id);

      const newFile = this.em.create(File, {
        absolutePath: absolutePath,
        relativePath: absolutePath,
        fileName: file.originalname,
        fileSize: file.size,
        parentFolder: uploadFileDto.data.folderId,
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
  async getAbsolutePath(folderId: number | null, filename: string) {
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
      absolutePath = path.join(absolutePath, relativePath, filename);
    } else {
      absolutePath = path.join(absolutePath, filename);
    }
    return absolutePath;
  }

  async updateFolder(updateFolderDto: UpdateFolderDto, folderId) {
    const folder = await this.em.findOneOrFail(Folder, folderId);
    folder.name = updateFolderDto.newName;

    if (updateFolderDto.newParentFolder === 0) {
      folder.parentFolder = null;
    } else if (updateFolderDto.newParentFolder) {
      const newParentFolder = await this.em.findOneOrFail(
        Folder,
        updateFolderDto.newParentFolder,
      );
      folder.parentFolder = newParentFolder;
    }

    this.em.flush();
    return folder;
  }
}
