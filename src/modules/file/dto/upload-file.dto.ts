import { Transform, Type } from 'class-transformer';
import {
  IsDefined,
  IsNotEmptyObject,
  IsObject,
  ValidateNested,
} from 'class-validator';

export class UploadData {
  folderId: number | null;
}

export class UploadFileDto {
  file: Express.Multer.File;

  @Transform(({ value }) => JSON.parse(value), { toClassOnly: true })
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => UploadData)
  data: UploadData;
}
