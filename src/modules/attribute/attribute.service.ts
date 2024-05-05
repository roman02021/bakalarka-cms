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

    console.log(collection, await knex.schema.hasTable(collection));

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
          await this.createAttribute(trx, attribute, fetchedCollection[0].id);
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

      return {
        status: 200,
        message: `${createAttributesDto.attributes.length} attributes in ${collection} created`,
      };
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

  async createAttribute(
    trx: Knex.Transaction<any, any[]>,
    attribute: Attribute,
    collectionId: string,
  ) {
    await trx('cms_attributes').insert({
      collection_id: collectionId,
      name: attribute.name,
      display_name: attribute.displayName,
      type: attribute.type,
      relation_type: attribute.relationType,
      referenced_column: attribute.referencedColumn,
      referenced_table: attribute.referencedTable,
      created_at: new Date(),
      updated_at: new Date(),
    });

    if (attribute.relationType === 'manyToMany') {
      //TODO
      // const referencedCollection = await trx('cms_collections').where(
      //   'name',
      //   attribute.referencedTable,
      // );
      // if (referencedCollection.length > 0) {
      //   await trx('cms_attributes').insert({
      //     collection_id: referencedCollection[0].id,
      //     name: attribute.name,
      //     display_name: attribute.displayName,
      //     type: attribute.type,
      //     relation_type: attribute.relationType,
      //     referenced_column: attribute.referencedColumn,
      //     referenced_table: attribute.referencedTable,
      //     created_at: new Date(),
      //     updated_at: new Date(),
      //   });
      // }
    }
  }

  async addColumnToTable(
    table: Knex.AlterTableBuilder,
    attribute: Attribute,
    trx: Knex.Transaction<any, any[]>,
    collection: string,
  ) {
    try {
      if (attribute.type === 'text') {
        if (attribute.isRequired) {
          table.string(attribute.name).notNullable();
        } else {
          table.string(attribute.name).nullable();
        }
      } else if (attribute.type === 'decimal') {
        if (attribute.isRequired) {
          table.decimal(attribute.name).notNullable();
        } else {
          table.decimal(attribute.name).nullable();
        }
      } else if (attribute.type === 'integer') {
        if (attribute.isRequired) {
          table.integer(attribute.name).notNullable();
        } else {
          table.integer(attribute.name).nullable();
        }
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
        } else if (attribute.relationType === 'manyToMany') {
          // const referencedCollection = await trx('cms_collections').where(
          //   'name',
          //   attribute.referencedTable,
          // );
          // const thisCollection = await trx('cms_collections').where(
          //   'name',
          //   collection,
          // );

          // console.log('yooo', referencedCollection, thisCollection);

          // if (
          //   referencedCollection.length === 0 ||
          //   thisCollection.length === 0
          // ) {
          //   return new HttpException(
          //     "Referenced collection doesn't exist.",
          //     HttpStatus.BAD_REQUEST,
          //   );
          // }

          // table
          //   .integer(`${attribute.referencedTable}_id`)
          //   .defaultTo(referencedCollection[0].id);
          // table
          //   .foreign(`${attribute.referencedTable}_id`)
          //   .references('id')
          //   .inTable('cms_collections');
          // await trx.schema.alterTable(attribute.referencedTable, (table) => {
          //   table.integer(`${collection}_id`).defaultTo(thisCollection[0].id);
          //   table
          //     .foreign(`${collection}_id`)
          //     .references('id')
          //     .inTable('cms_collections');
          // });

          await trx.schema.createTable(
            `${collection}_${attribute.referencedTable}`,
            (table) => {
              console.log(table);
              table.integer(`${collection}_id`);
              table
                .foreign(`${collection}_id`)
                .references('id')
                .inTable(collection);
              console.log('MERAB');
              table.integer(`${attribute.referencedTable}_id`);
              console.log('MERAB2');
              table
                .foreign(`${attribute.referencedTable}_id`)
                .references('id')
                .inTable(attribute.referencedTable);
            },
          );

          console.log('yooo', 'mebab');
        }
      } else if (attribute.type === 'image') {
        if (attribute.isRequired) {
          table.integer(attribute.name).notNullable();
        } else {
          table.integer(attribute.name).nullable();
        }

        table.foreign(attribute.name).references('id').inTable('cms_files');
      } else if (attribute.type === 'file') {
        if (attribute.isRequired) {
          table.integer(attribute.name).notNullable();
        } else {
          table.integer(attribute.name).nullable();
        }
        table.foreign(attribute.name).references('id').inTable('cms_files');
      } else if (attribute.type === 'boolean') {
        if (attribute.isRequired) {
          table.boolean(attribute.name).notNullable();
        } else {
          table.boolean(attribute.name).nullable();
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

  // async getAttributes(collectionId) {}

  async deleteColumn(collection: string, columnName: string) {
    const knex = this.em.getKnex();

    console.log(collection);

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
          } else if (relationType === 'manyToMany') {
            await trx.schema.dropTable(`${collection}_${referencedTable}`);
          }
        } else {
          await trx('cms_attributes').where('id', attribute[0].id).del();
        }
      });
      return {
        message: `Attribute ${columnName} in ${collection} was deleted`,
      };
    } catch (error) {
      return new HttpException('Something went wrong.', HttpStatus.BAD_REQUEST);
    }
  }
}
