import { Injectable } from '@nestjs/common';
import { createWriteStream } from 'fs';
import { FileDto } from './dto/file.dto';
import { EntityManager } from '@mikro-orm/postgresql';
import { File } from './entities/file.entity';
import multer from 'multer';
import { join } from 'path';
import { User } from '../user/entities/User.entity';
import { UploadFileDto } from './dto/upload-file';

@Injectable()
export class FileService {
  constructor(private em: EntityManager) {}

  baseFileFolder: string = '/files';

  async saveFile(
    file: Express.Multer.File,
    user: User,
    uploadFileDto: UploadFileDto,
  ) {
    console.log('test', file, uploadFileDto, 'cock');

    const existingFile = await this.em.find(File, {
      fileName: file.filename,
      parentFolder: uploadFileDto.folderId,
    });
    console.log(existingFile, 'yo');
    // this.em.insert(File, {
    //   createdBy: user.id,
    //   relativePath: file.path,
    //   fileSize: file.size,
    //   parentFolder: null,
    //   absolutePath: join(__dirname, file.path),
    //   fileName: file.filename,
    // });

    // fileDto.path;
    // const newFile = this.em.insert(File, {});

    // const storage = multer.diskStorage({
    //   destination: function (req, file, cb) {
    //     cb(null, '/files');
    //   },
    //   filename: function (req, file, cb) {
    //     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    //     cb(null, file.fieldname + '-' + uniqueSuffix);
    //   },
    // });

    // multer({ storage: storage });

    // const ws = createWriteStream(
    //   `${this.baseFileFolder}/${fileDto.path}/${fileDto.name}`,
    // );
    // ws.write(file.buffer);
    return 'saved';
  }
  async createFolder() {
    return 'TODO';
  }
  async getAllFiles() {
    return 'TODO';
  }
  async getFilesInFolder(folder: string) {
    return 'TODO';
  }
}
