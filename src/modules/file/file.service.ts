import { Injectable } from '@nestjs/common';
import { createWriteStream } from 'fs';
import { FileDto } from './dto/file.dto';

@Injectable()
export class FileService {
  baseFileFolder: string = '/files';

  async saveFile(fileDto: FileDto, file) {
    console.log(file, fileDto);
    const ws = createWriteStream(
      `${this.baseFileFolder}/${fileDto.path}/${fileDto.name}`,
    );
    ws.write(file.buffer);
  }
  // async createFolder(folderDto: FolderDto) {
  //   console.log(file);
  //   const ws = createWriteStream(`${this.baseFileFolder}/${file.originalname}`);
  //   ws.write(file.buffer);
  // }
}
