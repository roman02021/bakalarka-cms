import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { EntityManager } from '@mikro-orm/postgresql';
import { User } from 'src/types/user';
import { Collection } from './entities/collection.entity';
import { AttributeService } from '../attribute/attribute.service';
import { MikroORM } from '@mikro-orm/core';

@Injectable()
export class CollectionService {
  constructor(
    private readonly em: EntityManager,
    private readonly attributeService: AttributeService,
    private readonly orm: MikroORM,
  ) {}
  async createCollection(createCollectionDto: CreateCollectionDto, user: User) {
    try {
      const knex = this.em.getKnex();

      if (await knex.schema.hasTable(createCollectionDto.name)) {
        return new HttpException(
          'Collection already exists.',
          HttpStatus.BAD_REQUEST,
        );
      }

      await knex.transaction(async (trx) => {
        //create a collection in cms_collections
        const collection = await trx(this.em.getMetadata(Collection).tableName)
          .insert({
            name: createCollectionDto.name,
            created_by: user.id,
            created_at: new Date(),
            updated_at: new Date(),
            display_name: createCollectionDto.displayName,
          })
          .returning('*');

        //create attributes in cms_attributes
        await Promise.all(
          createCollectionDto.attributes.map(async (attribute) => {
            await trx('cms_attributes').insert({
              collection_id: collection[0].id,
              name: attribute.name,
              display_name: attribute.displayName,
              type: attribute.type,
              referenced_column: attribute.referencedColumn,
              referenced_table: attribute.referencedTable,
              relation_type: attribute.relationType,
              created_at: new Date(),
              updated_at: new Date(),
            });
          }),
        );

        //create a new table with provided columns (attributes/relations)
        await trx.schema.createTable(createCollectionDto.name, (table) => {
          table.increments('id').primary();
          table.integer('created_by').unsigned().references('cms_users.id');
          table
            .integer('collection_id')
            .unsigned()
            .references('cms_collections');
          table.timestamps(true, true);

          createCollectionDto.attributes.map((attribute) => {
            this.attributeService.addColumnToTable(
              table,
              attribute,
              trx,
              createCollectionDto.name,
            );
          });
        });

        //Nemapovali sa ti polia entity na tabulku v db
        //Napr. collectionName sa nemapovalo na collection_name v db
      });

      return {
        message: `Created collection : ${createCollectionDto.name}`,
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
  async getCollectionById(collectionId: string) {
    const collection = await this.em.findOneOrFail(
      Collection,
      { name: collectionId },
      {
        populate: ['attributes'],
      },
    );

    return collection;
  }
  async getAllCollections() {
    const collections = await this.em
      .createQueryBuilder(Collection)
      .select('*');

    return collections;
  }
  async deleteCollection(collectionName: string) {
    try {
      const knex = this.em.getKnex();

      if (!(await knex.schema.hasTable(collectionName))) {
        return new HttpException(
          "Collection doesn't exist.",
          HttpStatus.BAD_REQUEST,
        );
      }

      await knex.transaction(async (trx) => {
        const collection = await trx('cms_collections').where(
          'name',
          collectionName,
        );

        const collectionAttributes = await trx('cms_attributes').where(
          'collection_id',
          collection[0].id,
        );

        for (const attribute of collectionAttributes) {
          if (attribute.type === 'relation') {
            await this.attributeService.deleteColumn(
              collectionName,
              attribute.referenced_table,
            );
          }
        }

        await trx('cms_collections').where('name', collectionName).del();

        await trx.schema.dropTableIfExists(collectionName);
      });

      return `Collection deleted: ${collectionName}`;
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
  async createCollectionTest(
    createCollectionDto: CreateCollectionDto,
    user: User,
  ) {
    this.orm.entityGenerator.generate({
      save: true,
      path: process.cwd() + '/my-entities',
    });
    return 'test';
  }
}
