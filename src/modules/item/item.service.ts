import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { Collection, EntityManager } from '@mikro-orm/postgresql';
import { User } from 'src/types/user';
import { Attribute } from '../attribute/entities/attribute.entity';

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

      // console.log(collection, 'CCyooo', attributes);

      if (collectionMeta.length === 0) {
        return "Collection doesn't exist";
      }

      // console.log(collectionMeta, collectionMeta[0].id);

      await knex.transaction(async (trx) => {
        const collectionAttributes = await trx('cms_attributes').where(
          'collection_id',
          collectionMeta[0].id,
        );

        // console.log('GOGOGO', collectionAttributes);

        const itemId = await trx(collection)
          .insert({
            created_by: user.id,
            collection_id: collectionMeta[0].id,
          })
          .returning('id');

        // console.log(itemId, 'yooo', attributes);

        for (const collectionAttribute of collectionAttributes) {
          console.log(collectionAttribute, 'CPCL');
          for (const attribute in attributes) {
            // console.log(attribute);
            if (collectionAttribute.name === attribute) {
              if (collectionAttribute.type === 'relation') {
                if (collectionAttribute.relation_type === 'oneToOne') {
                } else if (collectionAttribute.relation_type === 'oneToMany') {
                  console.log(
                    'yo',
                    collectionAttribute.referenced_column,
                    attributes[attribute],
                    `${collection}_${collectionAttribute.referenced_column}`,
                  );
                  console.log(
                    await trx(collectionAttribute.referenced_table)
                      .where(
                        collectionAttribute.referenced_column,
                        attributes[attribute],
                      )
                      .update({
                        [`${collection}_${collectionAttribute.referenced_column}`]:
                          itemId[0].id,
                      }),
                  );
                  // .insert({
                  //   [`${collection}_${collectionAttribute.referenced_column}`]:
                  //     itemId[0].id,
                  // });

                  delete attributes[attribute];
                } else if (collectionAttribute.relation_type === 'manyToMany') {
                  //TODO
                }
              } else if (collectionAttribute.type === 'file') {
                if (attributes[collectionAttribute.name] === '') {
                  attributes[`${collectionAttribute.name}`] = null;
                }
              }
            }
          }
        }

        console.log(itemId[0], 'OPUTSIDE TRAN');

        await trx(collection)
          .where('id', itemId[0].id)
          .update({
            ...attributes,
          });

        // console.log(collectionAttributes, attributes);
      });

      return {
        message: `Created new ${collection}`,
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

      console.log(collectionMeta, collectionMeta[0].id);

      await knex.transaction(async (trx) => {
        const collectionAttributes = await trx('cms_attributes').where(
          'collection_id',
          collectionMeta[0].id,
        );

        const item = await trx(collection).where('id', id);

        console.log(item, attributes, 'GINA', collectionAttributes);

        for (const collectionAttribute of collectionAttributes) {
          // console.log(collectionAttribute, 'CPCL');
          for (const attribute in attributes) {
            console.log(attribute, 'COCK', collectionAttribute.name);
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
                if (attributes[collectionAttribute.name] === '') {
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

        // console.log(collectionAttributes, attributes);
      });

      return {
        message: 'Success',
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

      // console.log(
      //   items,
      //   items[`${relationsToPopulate[0]}_id`],
      //   `${relationsToPopulate[0]}_id`,
      // );

      await knex.transaction(async (trx) => {
        const collectionAttributes = await trx('cms_attributes').where(
          'collection_id',
          collectionMeta[0].id,
        );

        const fileAttributes = collectionAttributes.filter(
          (collectionAttribute) => collectionAttribute.type === 'file',
        );

        // console.log(fileAttributes);

        //pozri ine riesenie okrem promise.all alebo pozri ci je promise.all dobre
        await Promise.all(
          items.map(async (item) => {
            // for(const itemFiles of item){
            //   console.log(itemFiles)
            // }

            // console.log(item, 'yo');

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
                // console.log(item[`${relation}_id`], relation, item, 'COOOOCKA');

                const relationAttribute = await trx('cms_attributes')
                  .where('collection_id', collectionMeta[0].id)
                  .andWhere('name', relation)
                  .andWhere('type', 'relation');

                if (relationAttribute.length > 0) {
                  // console.log(relationAttribute, 'RIT');
                  if (relationAttribute[0].relation_type === 'oneToMany') {
                    // console.log(
                    //   'ANAL',
                    //   `${collectionMeta[0].name}_${relationAttribute[0].referenced_column}`,
                    // );
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

                    // console.log(foundRelation, 'RITKOS');
                  }
                }

                // console.log(relationAttribute);

                // const foundRelation = await trx(relation)
                //   .select('*')
                //   .where(`id`, item[`${relation}_id`]);

                // console.log(foundRelation, 'aoyyoyo');

                // if (foundRelation.length > 0) {
                //   item[relation] = foundRelation;
                //   delete item[`${relation}_id`];
                // }
                return item;
              }),
            );
          }),
        );
        // for (const item of items) {
        //   for (const relation of relationsToPopulate) {
        //     const foundRelation = await knex(relation)
        //       .select('*')
        //       .where(`id`, item[`${relation}_id`]);
        //     if (foundRelation.length > 0) {
        //       item[relation] = foundRelation;
        //       delete item[`${relation}_id`];
        //     }
        //     return item;
        //   }
        // }

        // console.log(collectionAttributes, 'CJINGAL', files);
      });

      // relationsToPopulate.map(async (relation) => {
      //   relations.push(
      //     await knex
      //       .from(relation)
      //       .select('*', `id`, `${items[`${relation}_id`]}`),
      //   );
      // });

      // items.select('blog');

      // console.log(await items);

      return items;

      return 'test';
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
