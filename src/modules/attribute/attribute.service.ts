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
      const fetchedCollection = await knex('cms_collections').where(
        'name',
        collection,
      );

      if (fetchedCollection.length === 0) {
        return new HttpException(
          "Collection doesn't exist.",
          HttpStatus.BAD_REQUEST,
        );
      }
      await knex.transaction(async (trx) => {
        // create attributes in cms_attributes
        for (const attribute of createAttributesDto.attributes) {
          await trx('cms_attributes').insert({
            collection_id: fetchedCollection[0].id,
            name: attribute.name,
            display_name: attribute.displayName,
            type: attribute.type,
            relation_type: attribute.relationType,
            referenced_column: attribute.referencedColumn,
            referenced_table: attribute.referencedTable,
            created_at: new Date(),
            updated_at: new Date(),
          });
        }

        //create columns in table or referenced table
        await trx.schema.table(collection, async (table) => {
          for (const attribute of createAttributesDto.attributes) {
            await this.addColumnToTable(
              table,
              attribute,
              trx,
              fetchedCollection[0].name,
            );
          }
        });
      });

      return `Attributes created`;
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

  async addColumnToTable(
    table: Knex.AlterTableBuilder,
    attribute: Attribute,
    trx: Knex.Transaction<any, any[]>,
    collection: string,
  ) {
    try {
      if (attribute.type === 'string') {
        table.string(attribute.name);
      } else if (attribute.type === 'decimal') {
        table.decimal(attribute.name);
      } else if (attribute.type === 'integer') {
        table.integer(attribute.name);
      } else if (attribute.type === 'relation') {
        if (attribute.relationType === 'oneToOne') {
          table.integer(`${attribute.referencedTable}_id`);
          table
            .foreign(`${attribute.referencedTable}_id`)
            .references(attribute.referencedColumn)
            .inTable(attribute.referencedTable);
        } else if (attribute.relationType === 'oneToMany') {
          await trx.schema.alterTable(attribute.referencedTable, (table) => {
            table
              .integer(`${collection}_id`)
              .unsigned()
              .nullable()
              .defaultTo(null);

            table
              .foreign(`${collection}_id`)
              .references('id')
              .inTable(collection);
          });
        } else if (attribute.relationType === 'manyToOne') {
          //TODO
        } else if (attribute.relationType === 'manyToMany') {
          //TODO
          trx.schema.createTable(
            `${attribute.name}_${attribute.referencedTable}`,
            (table) => {
              table.integer(`${attribute.name}_id`).nullable();
              table
                .foreign(`${attribute.name}_id`)
                .references('id')
                .inTable(attribute.name);

              table.integer(`${attribute.referencedTable}_id`).notNullable();
              table
                .foreign(`${attribute.referencedTable}_id`)
                .references('id')
                .inTable(attribute.referencedTable);
            },
          );
        }
      } else if (attribute.type === 'file') {
        table.integer(attribute.name).nullable();
        table.foreign(attribute.name).references('id').inTable('cms_files');
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
      return new HttpException(
        'Collection does not exist',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      await knex.transaction(async (trx) => {
        const collectionScheme = await trx('cms_collections').where(
          'name',
          collection,
        );
        const attribute = await trx('cms_attributes')
          .where('collection_id', collectionScheme[0].id)
          .andWhere('name', columnName);

        if (attribute[0].type === 'relation') {
          const relationType = attribute[0].relation_type;
          const referencedColumn = attribute[0].referenced_column;
          const referencedTable = attribute[0].referenced_table;
          if (relationType === 'oneToOne') {
            //delete attribute from attributes table
            await trx('cms_attributes').where('id', attribute[0].id).del();

            //remove relation column from collection table
            await trx.schema.alterTable(collection, (table) => {
              table.dropColumn(`${collection}_${referencedColumn}`);
            });
          } else if (relationType === 'oneToMany') {
            //delete attribute from attributes table
            await trx('cms_attributes').where('id', attribute[0].id).del();

            //remove relation column from collection table
            await trx.schema.alterTable(referencedTable, (table) => {
              table.dropColumn(`${collection}_${referencedColumn}`);
            });
          } else if (relationType === 'manyToOne') {
            return 'TODO';
          }
        }
      });
      return `Attribute deleted`;
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
}
