import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateAttributesDto } from './dto/attribute.dto';
import { EntityManager, Knex } from '@mikro-orm/postgresql';
import { Attribute } from '../attribute/entities/attribute.entity';
import { RelationsService } from 'src/relations/relations.service';

@Injectable()
export class AttributeService {
  constructor(
    private readonly em: EntityManager,
    private readonly relationsService: RelationsService,
  ) {}
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

  //creates attribute in cms_attributes
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
      const referencedCollection = await trx('cms_collections').where(
        'name',
        attribute.referencedTable,
      );
      if (referencedCollection.length > 0) {
        await trx('cms_attributes').insert({
          collection_id: referencedCollection[0].id,
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
    }
  }

  //creates column in table
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
          table
            .integer(`${attribute.name}_id`)
            .defaultTo(null)
            .nullable()
            .unique();

          table
            .foreign(`${attribute.name}_id`)
            .references(attribute.referencedColumn)
            .inTable(attribute.referencedTable);

          await trx.schema.alterTable(attribute.referencedTable, (table) => {
            table
              .integer(`${collection}_id`)
              .unsigned()
              .nullable()
              .defaultTo(null)
              .unique();

            table
              .foreign(`${collection}_id`)
              .references('id')
              .inTable(collection);
          });
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
          await trx.schema.createTable(
            `${collection}_${attribute.referencedTable}`,
            (table) => {
              table.integer(`${collection}_id`).notNullable();
              table
                .foreign(`${collection}_id`)
                .references('id')
                .inTable(collection)
                .onDelete('CASCADE');
              table.integer(`${attribute.referencedTable}_id`).notNullable();
              table
                .foreign(`${attribute.referencedTable}_id`)
                .references('id')
                .inTable(attribute.referencedTable)
                .onDelete('CASCADE');

              table.unique([
                `${attribute.referencedTable}_id`,
                `${collection}_id`,
              ]);
            },
          );
        }
      } else if (attribute.type === 'image') {
        if (attribute.isRequired) {
          table.integer(attribute.name).notNullable();
        } else {
          table.integer(attribute.name).nullable();
        }

        table
          .foreign(attribute.name)
          .references('id')
          .inTable('cms_files')
          .onDelete('SET NULL');
      } else if (attribute.type === 'file') {
        if (attribute.isRequired) {
          table.integer(attribute.name).notNullable();
        } else {
          table.integer(attribute.name).nullable();
        }
        table
          .foreign(attribute.name)
          .references('id')
          .inTable('cms_files')
          .onDelete('SET NULL');
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
          .andWhere('name', columnName)
          .first();

        if (attribute.type === 'relation') {
          const relationType = attribute.relation_type;
          const referencedColumn = attribute.referenced_column;
          const referencedTable = attribute.referenced_table;
          if (relationType === 'oneToOne') {
            //delete attribute from attributes table
            await trx('cms_attributes').where('id', attribute.id).del();

            //remove relation column from collection table
            await trx.schema.alterTable(collection, (table) => {
              table.dropColumn(`${attribute.name}_${referencedColumn}`);
            });
            await trx.schema.alterTable(referencedTable, (table) => {
              table.dropColumn(`${collection}_id`);
            });
          } else if (relationType === 'oneToMany') {
            //delete attribute from attributes table
            await trx('cms_attributes').where('id', attribute.id).del();
            //remove relation column from collection table
            await trx.schema.alterTable(referencedTable, (table) => {
              table.dropColumn(`${collection}_${referencedColumn}`);
            });
          } else if (relationType === 'manyToMany') {
            const associationTable =
              await this.relationsService.getAssociationTable(
                trx,
                collection,
                referencedTable,
              );
            await trx.schema.dropTable(associationTable);

            const referencedCollection = await trx('cms_collections').where(
              'name',
              attribute.referenced_table,
            );

            await trx('cms_attributes')
              .where('collection_id', referencedCollection[0].id)
              .andWhere('name', collection)
              .del();
          }
        } else {
          await trx('cms_attributes').where('id', attribute.id).del();
        }
      });
      return {
        message: `Attribute ${columnName} in ${collection} was deleted`,
      };
    } catch (error) {
      console.log(error);
      return new HttpException('Something went wrong.', HttpStatus.BAD_REQUEST);
    }
  }
}
