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

      console.log(collectionMeta, collectionMeta[0].id);

      const itemId = await knex(collection)
        .insert({
          created_by: user.id,
          collection_id: collectionMeta[0].id,
          ...attributes,
        })
        .returning('id');

      return itemId;
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
    user: User,
  ) {
    return 'TODO';
  }
  async getItem(collection: string, id: number) {
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
  async getItems(collection: string) {
    try {
      // const itemTest = await this.em.findAll(collection);

      // console.log(itemTest);

      const knex = this.em.getKnex();

      const item = await knex(collection);

      const attributes = await this.em.findAll(Attribute, {
        where: {
          collection: item[0].collection_id,
        },
      });

      let relations = [];
      attributes.map(async (attribute) => {
        if (attribute.type === 'relation') {
          const neviem = await knex(collection).join(
            attribute.referencedTable,
            `${attribute.referencedTable}_id`,
            `${attribute.referencedTable}.id`,
          );
          console.log(neviem, 'yoyo');
        }
      });

      console.log(item, attributes, item[0].id);

      return item;
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
