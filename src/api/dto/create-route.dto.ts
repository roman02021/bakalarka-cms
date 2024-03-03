import { SomeJSONSchema } from 'ajv/dist/types/json-schema';
import { Attribute } from '../types/attribute';

export class CreateRouteDto {
  name: string;
  pluralName: string;
  attributeSchema: SomeJSONSchema;
}
