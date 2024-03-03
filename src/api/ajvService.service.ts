import { Injectable } from '@nestjs/common';
import Ajv from 'ajv';

@Injectable()
export class AjvService {
  private ajv: Ajv;

  constructor(ajv?: Ajv) {
    if (!ajv) {
      ajv = new Ajv();
    }

    this.ajv = ajv;
  }
}
