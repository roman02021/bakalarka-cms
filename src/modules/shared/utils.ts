import { Dictionary } from '@mikro-orm/core';
import { ValidationError } from 'class-validator';

export function buildError(errors: ValidationError[]) {
  const result = {} as Dictionary;

  for (const el of errors) {
    const prop = el.property;
    Object.entries(el.constraints!).forEach((constraint) => {
      result[prop + constraint[0]] = `${constraint[1]}`;
    });
  }

  return result;
}
