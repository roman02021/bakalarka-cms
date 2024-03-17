import { Injectable } from '@nestjs/common';
import { diskStorage } from 'multer';

@Injectable()
export class StorageService {
  saveFile(file: Express.Multer.File, path?: string) {
    diskStorage({});
  }
}
