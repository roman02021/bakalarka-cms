import { Attribute } from '../types/attribute';

export class CreateObjectDto {
  route_id: number;
  attributes: Attribute[];
}
