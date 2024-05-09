import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { EntityManager } from '@mikro-orm/postgresql';
import { User } from 'src/types/user';

import { Collection } from '../collection/entities/collection.entity';
import { RelationsService } from '../../relations/relations.service';
import { File } from '../file/entities/file.entity';
import { Attribute } from '../attribute/entities/attribute.entity';
import ApiQueryParameters from 'src/types/queryParameters';
import { query } from 'express';
import { size } from 'lodash';
import ApiResponse from 'src/types/apiResponse';

@Injectable()
export class ItemsService {
  constructor(
    private readonly em: EntityManager,
    private readonly relationsService: RelationsService,
  ) {}
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
        return new HttpException(
          `Collection named ${collection} does not exist`,
          HttpStatus.NOT_FOUND,
        );
      }

      await knex.transaction(async (trx) => {
        const collectionAttributes = (await trx('cms_attributes').where(
          'collection_id',
          collectionMeta[0].id,
        )) as Attribute[];

        const attributesWithoutRelations: Record<string, any> = {};

        for (const collectionAttribute of collectionAttributes.filter(
          (x) => x.type !== 'relation',
        )) {
          console.log(collectionAttribute, collectionAttribute.name, 'opa');
          for (const attribute in attributes) {
            if (collectionAttribute.name === attribute) {
              attributesWithoutRelations[collectionAttribute.name] =
                attributes[attribute];
              if (collectionAttribute.type === 'file') {
                if (
                  attributes[collectionAttribute.name] === '' ||
                  attributes[collectionAttribute.name] === 0
                ) {
                  attributes[`${collectionAttribute.name}`] = null;
                }
              } else if (collectionAttribute.type === 'image') {
                const image = (
                  await trx('cms_files').where('id', attributes[attribute])
                )[0] as File;
                if (!image) {
                  throw new Error('Image does not exist');
                }
                if (
                  !['jpg', 'jpeg', 'png', 'svg', 'webp', 'gif'].includes(
                    image.extension,
                  )
                ) {
                  throw new Error('Unsupported image format');
                }
              }
            }
          }
        }

        console.log(
          attributesWithoutRelations,
          collectionMeta[0],
          'BEFORE INSERT',
        );

        const itemOrder = await trx(collection).max('item_order').first();

        console.log(itemOrder, itemOrder.max);

        const insertedItem: { id: number } = (
          await trx(collection)
            .insert({
              created_by: user.id,
              updated_at: new Date(),
              item_order: itemOrder.max < 10 ? 10 : itemOrder.max + 10,
              collection_id: collectionMeta[0].id,
              ...attributesWithoutRelations,
            })
            .returning('id')
        )[0];

        for (const collectionRelation of collectionAttributes.filter(
          (x) => x.type === 'relation',
        )) {
          if (attributes[collectionRelation.name]) {
            await this.relationsService.addRelation(
              trx,
              collectionRelation['relation_type'],
              collectionRelation['referenced_column'],
              collectionRelation['referenced_table'],
              collection,
              insertedItem.id,
              attributes[collectionRelation.name],
            );
          }

          //Delete attributes that have no column in the table
          //oneToOne is in the current table
          //oneToMany is in the referenced table
          //manyToMany is in the association table
          if (
            collectionRelation['relation_type'] === 'oneToMany' ||
            collectionRelation['relation_type'] === 'manyToMany'
          ) {
            delete attributes[collectionRelation.name];
          } else {
            attributes[`${collectionRelation.name}_id`] =
              attributes[collectionRelation.name];
            delete attributes[collectionRelation.name];
          }
        }

        console.log(attributes, 'AFTER INSERT', insertedItem.id, 'ID');

        await trx(collection)
          .where('id', insertedItem.id)
          .update({
            ...attributes,
          });
      });

      return {
        message: `Created new ${collection}`,
      };
    } catch (error) {
      return new HttpException(error, HttpStatus.BAD_REQUEST);
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
        return new HttpException(
          `Collection named ${collection} does not exist`,
          HttpStatus.NOT_FOUND,
        );
      }

      const item = await knex(collection).where('id', id);

      if (item.length === 0) {
        return new HttpException(
          `Item with id ${id} was not found`,
          HttpStatus.NOT_FOUND,
        );
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
                  attributes[`${attribute}_id`] = attributes[attribute];
                  delete attributes[attribute];
                } else if (collectionAttribute.relation_type === 'oneToMany') {
                  if (attributes[attribute]) {
                    if (Array.isArray(attributes[attribute])) {
                      await this.relationsService.updateMultipleOneToManyRelations(
                        trx,
                        collectionAttribute.referenced_table,
                        collectionAttribute.referenced_column,
                        collection,
                        item[0].id,
                        attributes[attribute],
                      );
                    } else {
                      await this.relationsService.updateSingleOneToManyRelation(
                        trx,
                        collectionAttribute.referenced_table,
                        collectionAttribute.referenced_column,
                        collection,
                        item[0].id,
                        attributes[attribute],
                      );
                    }
                  }

                  delete attributes[attribute];
                } else if (collectionAttribute.relation_type === 'manyToMany') {
                  if (attributes[attribute]) {
                    const associationTable =
                      await this.relationsService.getAssociationTable(
                        trx,
                        collection,
                        collectionAttribute.referenced_table,
                      );
                    await trx(associationTable)
                      .where(`${collection}_id`, id)
                      .del();
                    if (Array.isArray(attributes[attribute])) {
                      for (const relation of attributes[attribute]) {
                        console.log(
                          relation,
                          collectionAttribute,
                          collection,
                          id,
                        );

                        await trx(associationTable)
                          .where(`${collection}_id`, id)
                          .insert({
                            [`${collection}_id`]: id,
                            [`${collectionAttribute.referenced_table}_id`]:
                              relation,
                          });
                      }
                    } else {
                      await trx(associationTable)
                        .where(`${collection}_id`, id)
                        .insert({
                          [`${collection}_id`]: id,
                          [`${collectionAttribute.referenced_table}_id`]:
                            attributes[attribute],
                        });
                    }
                    delete attributes[attribute];
                  }
                }
              } else if (collectionAttribute.type === 'file') {
                if (
                  attributes[collectionAttribute.name] === '' ||
                  attributes[collectionAttribute.name] === 0
                ) {
                  attributes[`${collectionAttribute.name}`] = null;
                }
              } else if (collectionAttribute.type === 'image') {
                const image = (
                  await trx('cms_files').where('id', attributes[attribute])
                )[0] as File;
                if (!image) {
                  throw new Error('Image does not exist');
                }

                if (
                  !['jpg', 'jpeg', 'png', 'svg', 'webp', 'gif'].includes(
                    image.extension,
                  )
                ) {
                  throw new Error('Unsupported image format');
                }
              }
            }
          }
        }

        if (Object.keys(attributes).length) {
          await trx(collection)
            .where('id', item[0].id)
            .update({
              ...attributes,
            });
        }
      });

      return {
        message: `Item ${item[0].id}`,
      };
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
  async getItems(
    collection: string,
    queryParameters: ApiQueryParameters,
  ): Promise<ApiResponse> {
    try {
      const collectionMeta = await this.em.findOneOrFail(
        Collection,
        {
          name: collection,
        },
        {
          failHandler: () => new NotFoundException(),
        },
      );

      const knex = this.em.getKnex();
      const total = await knex(collection).count('id').first();
      const items = await knex
        .from(collection)
        .select('*')
        .orderBy(queryParameters.sortBy, queryParameters.sortOrder)
        .limit(queryParameters.limit)
        .offset(queryParameters.offset * queryParameters.limit);

      // console.log(
      //   collection,
      //   queryParameters.sortBy,
      //   queryParameters.sortOrder,
      //   queryParameters.limit,
      //   items,
      //   'items',
      //   total,
      //   'total',
      // );

      await knex.transaction(async (trx) => {
        const collectionAttributes = await trx('cms_attributes').where(
          'collection_id',
          collectionMeta.id,
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

                //toto zmen asi
                item[fileAttribute.name] = 'files' + file[0].file_path;
              }
            }

            console.log(item);

            await Promise.all(
              queryParameters.populate.map(async (relation) => {
                console.log(relation, 'opa', collectionMeta.name);
                const relationAttribute = await trx('cms_attributes')
                  .where('collection_id', collectionMeta.id)
                  .andWhere('name', relation)
                  .andWhere('type', 'relation');

                // this.em.map(Attribute, relationAttribute);

                if (relationAttribute.length > 0) {
                  if (relationAttribute[0].relation_type === 'oneToOne') {
                    console.log(
                      relationAttribute[0],
                      'referenced_table',
                      item,
                      item['article_header_id'],
                      '<--- ITEM',
                      item[`${relationAttribute[0].name}_id`],
                      `${relationAttribute[0].name}_id`,
                    );
                    const relationId = item[`${relationAttribute[0].name}_id`];
                    console.log(relationId);
                    if (relationId !== null) {
                      console.log('yo', relationId, relationAttribute[0].name);
                      const foundRelation = await trx(relationAttribute[0].name)
                        .select('*')
                        .where('id', relationId);

                      console.log(foundRelation, 'foundRelation');

                      if (foundRelation.length > 0) {
                        item[relation] = foundRelation[0];
                      }
                    }
                    console.log('yoOOOO');
                  }
                  if (relationAttribute[0].relation_type === 'oneToMany') {
                    const foundRelation = await trx(
                      relationAttribute[0].referenced_table,
                    )
                      .select('*')
                      .where(
                        `${collectionMeta.name}_${relationAttribute[0].referenced_column}`,
                        item.id,
                      );

                    if (foundRelation.length > 0) {
                      item[relation] = foundRelation;
                      delete item[`${relation}_id`];
                    }
                  } else if (
                    relationAttribute[0].relation_type === 'manyToMany'
                  ) {
                    const associationTable =
                      await this.relationsService.getAssociationTable(
                        trx,
                        collection,
                        relationAttribute[0].referenced_table,
                      );

                    const foundRelation = await trx(associationTable)
                      .select('*')
                      .where(`${collectionMeta.name}_id`, item.id);

                    console.log(foundRelation, 'AYO');

                    const allRelations = [];

                    if (foundRelation.length > 0) {
                      // console.log(foundRelation);
                      // if (Array.isArray(foundRelation)) {
                      //   foundRelation.forEach((relation) => {

                      //   });
                      // }
                      if (Array.isArray(foundRelation[0])) {
                        for (const relation of foundRelation[0]) {
                          const item = await trx(
                            relationAttribute[0].referenced_table,
                          ).where(
                            'id',
                            relation[
                              `${relationAttribute[0].referenced_table}_id`
                            ],
                          );

                          allRelations.push(item[0]);
                        }

                        allRelations.push(item[0]);
                      } else {
                        for (const relation of foundRelation) {
                          const item = await trx(
                            relationAttribute[0].referenced_table,
                          ).where(
                            'id',
                            relation[
                              `${relationAttribute[0].referenced_table}_id`
                            ],
                          );

                          allRelations.push(item[0]);
                        }
                      }
                    }

                    console.log(foundRelation, 'AYO', allRelations);

                    if (foundRelation.length > 0) {
                      item[relation] = allRelations;
                    }
                  }
                }

                return item;
              }),
            );
          }),
        );
      });

      console.log(items);

      return {
        total: Number(total.count),
        items,
      };
    } catch (error) {
      if (error.response) {
        return error.response;
      } else {
        new HttpException(error, HttpStatus.BAD_REQUEST);
      }
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
