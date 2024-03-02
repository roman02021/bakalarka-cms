import { Attribute } from '../types/attribute';

export class CreateRouteDto {
  name: string;
  pluralName: string;
  attributes: Attribute[];
}
