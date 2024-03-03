import { JSONSchemaType, SomeJSONSchema } from 'ajv/dist/types/json-schema';
import { Attribute } from '../types/attribute';
import {
  IsEmail,
  IsJSON,
  IsNotEmpty,
  IsString,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import Ajv from 'ajv';

@ValidatorConstraint()
class Attributes implements ValidatorConstraintInterface {
  validate(attributes: object[]) {
    // console.log(attributes, 'c');
    // const ajv = new Ajv();

    // const schema: JSONSchemaType<Attribute> = {
    //   type: "object",
    //   properties: {
    //     name: {type: "string"},
    //     type: {type: {
    //       anyOf: [
    //         value
    //       ]
    //     }}
    //   }
    // }

    // attributes.forEach(attribute => attribute.)

    return false;
  }
}

export class CreateRouteDto {
  @IsString()
  name: string;
  @IsNotEmpty()
  pluralName: string;
  @Validate(Attributes)
  attributeSchema: Attribute[];
}
