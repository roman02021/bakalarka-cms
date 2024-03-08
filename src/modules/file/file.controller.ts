import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from './file.service';
import { AuthGuard } from '../auth/auth.guard';
import { FileDto } from './dto/file.dto';

@Controller('file')
@UseGuards(AuthGuard)
export class FileController {
  constructor(private fileService: FileService) {}
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(fileDto: FileDto, @UploadedFile() file: Express.Multer.File) {
    return this.fileService.saveFile(fileDto, file);
  }
}
