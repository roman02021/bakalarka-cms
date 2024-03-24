import { IsJSON, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class UploadData {
  folderId: number | null;
}

export class UploadFileDto {
  // @IsString()
  // name: string;
  file: Express.Multer.File;

  @Transform(({ value }) => JSON.parse(value))
  data: UploadData;
}
