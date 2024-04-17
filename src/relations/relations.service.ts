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
}
