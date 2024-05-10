// import { Attribute } from '../../../types/attribute';
import { IsString } from 'class-validator';

export class UpdateCollectionDto {
  @IsString()
  displayName: string;
}
