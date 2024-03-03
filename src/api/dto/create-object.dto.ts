import { Attribute } from '../types/attribute';

export class CreateObjectDto {
  routeId: number;
  attributes: Attribute[];
}
