import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Get,
  Param,
  Request,
  ParseFilePipe,
  Body,
  Put,
  Delete,
  UsePipes,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from './file.service';
import { AuthGuard } from '../auth/auth.guard';
import { User } from '../user/entities/User.entity';
import { UploadFileDto } from './dto/upload-file.dto';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { ValidationPipe } from '@nestjs/common';

@Controller('file')
@UseGuards(AuthGuard)
export class FileController {
  constructor(private fileService: FileService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @UsePipes(new ValidationPipe({ transform: true }))
  uploadFile(
    @UploadedFile(new ParseFilePipe({})) file: Express.Multer.File,
    @Request() req,
    @Body() uploadFileDto: UploadFileDto,
  ) {
    // console.log(uploadFileDto.folderId);
    const user: User = req.user;
    return this.fileService.saveFile(file, user, uploadFileDto.data.folderId);
  }

  @Post('folder')
  createFolder(@Body() createFolderDto: CreateFolderDto, @Request() req) {
    console.log(createFolderDto, 'controller');
    const user: User = req.user;
    return this.fileService.createFolder(createFolderDto, user);
  }

  @Put('folder/:folderId')
  updateFolder(
    @Body() updateFolderDto: UpdateFolderDto,
    @Param('folderId') folderId: number,
  ) {
    return this.fileService.updateFolder(updateFolderDto, folderId);
  }
  @Put(':fileId')
  updateFile(
    @Body() updateFolderDto: UpdateFolderDto,
    @Param('fileId') fileId: number,
  ) {
    return this.fileService.updateFile(updateFolderDto, fileId);
  }

  @Delete('folder/:folderId')
  deleteFolder(@Param('folderId') folderId: number) {
    return this.fileService.deleteFolder(folderId);
  }

  @Delete(':fileId')
  deleteFile(@Param('fileId') fileId: number) {
    return this.fileService.deleteFile(fileId);
  }

  @Get('folder')
  getFilesInRootFolder() {
    return this.fileService.getFilesInRootFolder();
  }

  @Get('folder/:folderId')
  getFilesInFolder(@Param('folderId') folderId: number | null) {
    return this.fileService.getFilesInFolder(folderId);
  }
}
