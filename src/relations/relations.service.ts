import { Knex } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RelationsService {
  async updateSingleOneToManyRelation(
    trx: Knex.Transaction<any, any[]>,
    referencedTable: string,
    referencedColumn: string,
    collection: string,
    itemId: number,
    referencedItemId: number,
  ) {
    await trx(referencedTable)
      .where(`${collection}_${referencedColumn}`, itemId)
      .update({
        [`${collection}_${referencedColumn}`]: null,
      });
    await trx(referencedTable)
      .where(referencedColumn, referencedItemId)
      .update({
        [`${collection}_${referencedColumn}`]: itemId,
      });
  }
  async updateMultipleOneToManyRelations(
    trx: Knex.Transaction<any, any[]>,
    referencedTable: string,
    referencedColumn: string,
    collection: string,
    itemId: number,
    referencedItemIds: number[],
  ) {
    await trx(referencedTable)
      .where(`${collection}_${referencedColumn}`, itemId)
      .update({
        [`${collection}_${referencedColumn}`]: null,
      });
    //update all new related entities to the primary key of the item
    for (const foreignKey of referencedItemIds) {
      console.log('after', foreignKey);
      await trx(referencedTable)
        .where(referencedColumn, foreignKey)
        .update({
          [`${collection}_${referencedColumn}`]: itemId,
        });
    }
  }
  async getAssociationTable(
    trx: Knex.Transaction<any, any[]>,
    collection: string,
    referencedTable: string,
  ): Promise<string> {
    let associationTable: string = '';

    if (await trx.schema.hasTable(`${collection}_${referencedTable}`)) {
      associationTable = `${collection}_${referencedTable}`;
    } else if (await trx.schema.hasTable(`${referencedTable}_${collection}`)) {
      associationTable = `${referencedTable}_${collection}`;
    } else {
      throw new Error('Association table not found');
    }
    return associationTable;
  }
  async addRelation(
    trx: Knex.Transaction<any, any[]>,
    relationType: string,
    referencedColumn: string,
    referencedTable: string,
    collection: string,
    itemId: number,
    keys: number[] | number,
  ) {
    if (relationType === 'oneToOne') {
    } else if (relationType === 'oneToMany') {
      if (Array.isArray(keys)) {
        for (const foreginKey of keys) {
          await trx(referencedTable)
            .where(referencedColumn, foreginKey)
            .update({
              [`${collection}_${referencedColumn}`]: itemId,
            });
        }
      } else {
        await trx(referencedTable)
          .where(referencedColumn, keys)
          .update({
            [`${collection}_${referencedColumn}`]: itemId,
          });
      }
      // delete keys;
    } else if (relationType === 'manyToMany') {
      const associationTable = await this.getAssociationTable(
        trx,
        collection,
        referencedTable,
      );

      if (Array.isArray(keys)) {
        console.log('ENTERING FOR LOOP', keys);
        for (const foreginKey of keys) {
          await trx(associationTable).insert({
            [`${collection}_id`]: itemId,
            [`${referencedTable}_id`]: foreginKey,
          });
        }
      } else {
        await trx(associationTable).insert({
          [`${collection}_id`]: itemId,
          [`${referencedTable}_id`]: keys,
        });
      }
    }
  }
}
