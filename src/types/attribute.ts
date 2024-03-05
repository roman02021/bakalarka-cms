// export type Attribute = {
//   name: string;
//   type: 'string' | 'integer' | 'decimal';
// };
import { IsString, IsIn } from 'class-validator';

const TYPES = ['string', 'integer', 'decimal'];
export class Attribute {
  @IsString()
  name: string;
  @IsIn(TYPES)
  type: string;
}
