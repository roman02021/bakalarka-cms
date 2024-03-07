import { IsString, IsIn } from 'class-validator';

const TYPES = ['string', 'integer', 'decimal'];
export class Attribute {
  @IsString()
  displayName: string;
  @IsString()
  name: string;
  @IsIn(TYPES)
  type: string;
}
