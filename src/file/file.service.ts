import { Injectable } from '@nestjs/common';
import { createWriteStream } from 'fs';

@Injectable()
export class FileService {
  async saveFile(file: any) {
    console.log(file);
    const ws = createWriteStream(`files/${file.originalname}`);
    ws.write(file.buffer);
  }
}
