import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { EntityManager } from '@mikro-orm/postgresql';
import { User } from 'src/types/user';

@Injectable()
export class ItemsService {
  constructor(private readonly em: EntityManager) {}
  async createItem(
    collection: string,
    attributes: Record<string, any>,
    user: User,
  ) {
    try {
      const knex = this.em.getKnex();

      const collectionMeta = await knex('cms_collections').where(
        'name',
        collection,
      );

      if (collectionMeta.length === 0) {
        return "Collection doesn't exist";
      }

      await knex.transaction(async (trx) => {
        const collectionAttributes = await trx('cms_attributes').where(
          'collection_id',
          collectionMeta[0].id,
        );

        const itemId = await trx(collection)
          .insert({
            created_by: user.id,
            collection_id: collectionMeta[0].id,
          })
          .returning('id');

        for (const collectionAttribute of collectionAttributes) {
          for (const attribute in attributes) {
            if (collectionAttribute.name === attribute) {
              if (collectionAttribute.type === 'relation') {
                if (collectionAttribute.relation_type === 'oneToOne') {
                } else if (collectionAttribute.relation_type === 'oneToMany') {
                  await trx(collectionAttribute.referenced_table)
                    .where(
                      collectionAttribute.referenced_column,
                      attributes[attribute],
                    )
                    .update({
                      [`${collection}_${collectionAttribute.referenced_column}`]:
                        itemId[0].id,
                    }),
                    delete attributes[attribute];
                } else if (collectionAttribute.relation_type === 'manyToMany') {
                  //TODO
                }
              } else if (collectionAttribute.type === 'file') {
                if (
                  attributes[collectionAttribute.name] === '' ||
                  attributes[collectionAttribute.name] === 0
                ) {
                  attributes[`${collectionAttribute.name}`] = null;
                }
              }
            }
          }
        }

        await trx(collection)
          .where('id', itemId[0].id)
          .update({
            ...attributes,
          });
      });

      return {
        message: `Created new ${collection}`,
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
  async updateItem(
    collection: string,
    id: number,
    attributes: Record<string, any>,
  ) {
    try {
      const knex = this.em.getKnex();

      const collectionMeta = await knex('cms_collections').where(
        'name',
        collection,
      );

      if (collectionMeta.length === 0) {
        return "Collection doesn't exist";
      }

      await knex.transaction(async (trx) => {
        const collectionAttributes = await trx('cms_attributes').where(
          'collection_id',
          collectionMeta[0].id,
        );

        const item = await trx(collection).where('id', id);

        for (const collectionAttribute of collectionAttributes) {
          for (const attribute in attributes) {
            if (collectionAttribute.name === attribute) {
              if (collectionAttribute.type === 'relation') {
                if (collectionAttribute.relation_type === 'oneToOne') {
                } else if (collectionAttribute.relation_type === 'oneToMany') {
                  if (attributes[attribute]) {
                    for (const relationAttribute of attributes[attribute]) {
                      await trx(collectionAttribute.referenced_table)
                        .where(
                          collectionAttribute.referenced_column,
                          relationAttribute,
                        )
                        .update({
                          [`${collection}_${collectionAttribute.referenced_column}`]:
                            item[0].id,
                        });
                    }
                  }

                  delete attributes[attribute];
                } else if (collectionAttribute.relation_type === 'manyToMany') {
                  //TODO
                }
              } else if (collectionAttribute.type === 'file') {
                if (
                  attributes[collectionAttribute.name] === '' ||
                  attributes[collectionAttribute.name] === 0
                ) {
                  attributes[`${collectionAttribute.name}`] = null;
                }
              }
            }
          }
        }

        if (attributes) {
          await trx(collection)
            .where('id', item[0].id)
            .update({
              ...attributes,
            });
        }
      });

      return {
        message: 'Success',
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
  async getItem(collection: string, id: number, relationsToPopulate: string[]) {
    try {
      const knex = this.em.getKnex();

      const item = await knex(collection).where('id', id);

      return item;
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
  async getItems(collection: string, relationsToPopulate: string[]) {
    try {
      const knex = this.em.getKnex();

      const collectionMeta = await knex('cms_collections').where(
        'name',
        collection,
      );
      if (collectionMeta.length === 0) {
        return 'Collection does not exist';
      }

      const items = await knex.from(collection).select('*');

      await knex.transaction(async (trx) => {
        const collectionAttributes = await trx('cms_attributes').where(
          'collection_id',
          collectionMeta[0].id,
        );

        const fileAttributes = collectionAttributes.filter(
          (collectionAttribute) => collectionAttribute.type === 'file',
        );

        //pozri ine riesenie okrem promise.all alebo pozri ci je promise.all dobre
        await Promise.all(
          items.map(async (item) => {
            for (const fileAttribute of fileAttributes) {
              if (typeof item[fileAttribute.name] === 'number') {
                const file = await trx('cms_files')
                  .select('*')
                  .where('id', item[fileAttribute.name]);

                item[fileAttribute.name] = file[0].relative_path;
              }
            }

            await Promise.all(
              relationsToPopulate.map(async (relation) => {
                const relationAttribute = await trx('cms_attributes')
                  .where('collection_id', collectionMeta[0].id)
                  .andWhere('name', relation)
                  .andWhere('type', 'relation');

                if (relationAttribute.length > 0) {
                  if (relationAttribute[0].relation_type === 'oneToMany') {
                    const foundRelation = await trx(relation)
                      .select('*')
                      .where(
                        `${collectionMeta[0].name}_${relationAttribute[0].referenced_column}`,
                        item.id,
                      );

                    if (foundRelation.length > 0) {
                      item[relation] = foundRelation;
                      delete item[`${relation}_id`];
                    }
                  }
                }

                return item;
              }),
            );
          }),
        );
      });

      return items;
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
  async deleteItem(collection: string, id: number) {
    try {
      const knex = this.em.getKnex();

      const itemId = await knex(collection).where('id', id).del();

      return itemId;
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
