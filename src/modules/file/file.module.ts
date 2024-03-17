import { Module } from '@nestjs/common';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { Folder } from './entities/folder.entity';
import { File } from './entities/file.entity';
import { MikroOrmModule } from '@mikro-orm/nestjs';

@Module({
  imports: [MikroOrmModule.forFeature([File, Folder])],
  controllers: [FileController],
  providers: [FileService],
})
export class FileModule {}
