import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateAttributesDto } from './dto/attribute.dto';
import { EntityManager, Knex } from '@mikro-orm/postgresql';
import { Attribute } from '../attribute/entities/attribute.entity';

@Injectable()
export class AttributeService {
  constructor(private readonly em: EntityManager) {}
  async addAttributesToCollection(
    collection: string,
    createAttributesDto: CreateAttributesDto,
  ) {
    const knex = this.em.getKnex();

    if (!(await knex.schema.hasTable(collection))) {
      return new HttpException(
        "Collection doesn't exist.",
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      await knex.schema.table(collection, (table) => {
        createAttributesDto.attributes.map((attribute) => {
          this.addColumnToTable(table, attribute);
        });
      });
      return `Attributes created`;
    } catch (error) {
      console.log(error);
      return new HttpException(
        'Something went wrong.',
        HttpStatus.BAD_REQUEST,
        {
          cause: error,
        },
      );
    }
  }

  async addColumnToTable(table: Knex.AlterTableBuilder, attribute: Attribute) {
    try {
      if (attribute.type === 'string') {
        table.string(attribute.name);
      } else if (attribute.type === 'decimal') {
        table.decimal(attribute.name);
      } else if (attribute.type === 'integer') {
        table.integer(attribute.name);
      } else if (attribute.type === 'relation') {
        if (attribute.relationType === 'oneToOne') {
          table.integer(`${attribute.referencedTable}_id`).notNullable();
          table
            .foreign(`${attribute.referencedTable}_id`)
            .references(attribute.referencedColumn)
            .inTable(attribute.referencedTable);
        } else if (attribute.relationType === 'oneToMany') {
          table.integer(`${attribute.referencedTable}_id`).notNullable();
          table
            .foreign(`${attribute.referencedTable}_id`)
            .references(attribute.referencedColumn)
            .inTable(attribute.referencedTable);
        } else if (attribute.relationType === 'manyToMany') {
          table.integer(`${attribute.referencedTable}_id`).notNullable();
          table
            .foreign(`${attribute.referencedTable}_id`)
            .references(attribute.referencedColumn)
            .inTable(attribute.referencedTable);
        }
      }
    } catch (error) {
      return new HttpException(
        'Something went wrong.',
        HttpStatus.BAD_REQUEST,
        {
          cause: error,
        },
      );
    }
  }

  async getAttributes(collectionId) {}

  async deleteColumn(collection: string, columnName: string) {
    const knex = this.em.getKnex();

    if (!(await knex.schema.hasTable(collection))) {
      return new HttpException('Route already exists.', HttpStatus.BAD_REQUEST);
    }

    try {
      await knex.schema.alterTable(collection, (table) => {
        table.dropColumn(columnName);
      });
      return `Attribute deleted`;
    } catch (error) {
      console.log(error);
      return new HttpException(
        'Something went wrong.',
        HttpStatus.BAD_REQUEST,
        {
          cause: error,
        },
      );
    }
  }
}
