import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Get,
  Param,
  Request,
  NotAcceptableException,
  ParseFilePipe,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from './file.service';
import { AuthGuard } from '../auth/auth.guard';
import { FileDto } from './dto/file.dto';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { User } from '../user/entities/User.entity';
import { UploadFileDto } from './dto/upload-file.dto';

@Controller('file')
@UseGuards(AuthGuard)
export class FileController {
  constructor(private fileService: FileService) {}
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './files',
        filename: (req, file, callback) => {
          const name = file.originalname.split('.')[0];
          const extension = extname(file.originalname);
          const randomName = Array(32).fill(null).join('');
          callback(null, `${name}-${randomName}${extension}`);
        },
      }),
    }),
  )
  uploadFile(
    @UploadedFile(new ParseFilePipe({})) file: Express.Multer.File,
    @Request() req,
    @Body() uploadFileDto: UploadFileDto,
  ) {
    console.log(uploadFileDto);
    const user: User = req.user;
    return this.fileService.saveFile(file, user, uploadFileDto);
  }
  @Post('folder/:folderName')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './files/ayo',
      }),
    }),
  )
  createFolder(@UploadedFile(new ParseFilePipe({})) file: Express.Multer.File) {
    console.log(file);
    return this.fileService.createFolder();
  }
  @Get('/')
  getAllFiles() {
    return this.fileService.getAllFiles();
  }
  @Get('/:folder')
  getFilesInFolder(@Param('folder') folder: string) {
    return this.fileService.getFilesInFolder(folder);
  }
}
