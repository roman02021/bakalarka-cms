import { IsString, IsIn, IsOptional } from 'class-validator';

const TYPES = ['string', 'integer', 'decimal', 'relation'];
export class Attribute {
  @IsString()
  displayName: string;
  @IsString()
  name: string;
  @IsIn(TYPES)
  type: string;
  @IsString()
  @IsOptional()
  referencedColumn: string;
  @IsString()
  @IsOptional()
  referencedTable: string;
}
