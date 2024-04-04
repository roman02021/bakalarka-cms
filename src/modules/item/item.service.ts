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
      // const itemTest = await this.em.findAll(collection);

      // console.log(itemTest);

      console.log(relationsToPopulate);

      const knex = this.em.getKnex();

      // const itemQuery = await knex('blog')
      //   .innerJoin('author', 'author.id', '=', 'blog.author_id')
      //   .select(knex.raw('coalesce(json_agg)'));

      const test = await knex
        .from('blog')
        .join('author', 'blog.author_id', 'author.id')
        .groupBy(['blog.id'])
        .select(['blog.id', knex.raw(`json_agg(author) as authors`)]);

      console.log(test);

      const test2 = knex.from(collection);

      relationsToPopulate.map((relation) => {
        test2
          .join(relation, `${collection}.${relation}_id`, `${relation}.id`)
          .groupBy([`${collection}.id`])
          .select(knex.raw(`json_agg(${relation}) as ${relation}`));
      });

      test2.select('blog');

      console.log(await test2);

      return await test2;

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
