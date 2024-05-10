import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { EntityManager } from '@mikro-orm/postgresql';
import { User } from 'src/types/user';
import { Collection } from './entities/collection.entity';
import { AttributeService } from '../attribute/attribute.service';
import { MikroORM } from '@mikro-orm/core';
import { Attribute } from '../attribute/entities/attribute.entity';
import { UpdateCollectionDto } from './dto/update-collection.dto';

@Injectable()
export class CollectionService {
  constructor(
    private readonly em: EntityManager,
    private readonly attributeService: AttributeService,
    private readonly orm: MikroORM,
  ) {}

  async updateCollection(
    collectionId: string,
    updateCollectionDto: UpdateCollectionDto,
  ) {
    try {
      const collection = await this.em.findOneOrFail(Collection, {
        name: collectionId,
      });

      collection.displayName = updateCollectionDto.displayName;

      this.em.persistAndFlush(collection);

      return {
        message: `Updated collection : ${collectionId}`,
      };
    } catch (error) {
      return new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async createCollection(createCollectionDto: CreateCollectionDto, user: User) {
    try {
      if (createCollectionDto.name.includes(' ')) {
        return new HttpException(
          'Collection name cannot contain spaces.',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (createCollectionDto.name.startsWith('cms_')) {
        return new HttpException(
          'Collection name cannot start with cms_',
          HttpStatus.BAD_REQUEST,
        );
      }

      const knex = this.em.getKnex();

      if (await knex.schema.hasTable(createCollectionDto.name)) {
        return new HttpException(
          'Collection already exists.',
          HttpStatus.BAD_REQUEST,
        );
      }

      await knex.transaction(async (trx) => {
        //create a collection in cms_collections

        const newCollection = this.em.create(Collection, {
          name: createCollectionDto.name,
          displayName: createCollectionDto.displayName,
          createdBy: user.id,
        });

        this.em.persist(newCollection);

        //create attributes in cms_attributes
        for (const attribute of createCollectionDto.attributes) {
          const newAttribute = new Attribute(
            attribute.displayName,
            attribute.name,
            attribute.type,
            newCollection,
            attribute.isRequired,
            attribute.relationType,
            attribute.referencedColumn,
            attribute.referencedTable,
          );
          this.em.persist(newAttribute);
          if (
            attribute.relationType === 'manyToMany' ||
            attribute.relationType === 'oneToOne'
          ) {
            //you need to use knex here because mikroorm flushes when finding a managed entitiy
            const referencedCollection = await trx('cms_collections')
              .where('name', attribute.referencedTable)
              .first();

            if (!referencedCollection) {
              throw new Error('Referenced collection not found.');
            }

            const referencedTableRelationAttribute = new Attribute(
              newCollection.displayName,
              newCollection.name,
              attribute.type,
              referencedCollection.id,
              attribute.isRequired,
              attribute.relationType,
              attribute.referencedColumn,
              newCollection.name,
            );
            this.em.persist(referencedTableRelationAttribute);
          }
        }

        //create a new table with provided columns (attributes/relations)
        await trx.schema.createTable(createCollectionDto.name, (table) => {
          table.increments('id').primary();
          table.integer('created_by').unsigned().references('cms_users.id');
          table.integer('updated_by').unsigned().references('cms_users.id');
          table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable;
          table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable;
          table.increments('item_order', { primaryKey: false });
          table
            .integer('collection_id')
            .unsigned()
            .references('cms_collections');

          createCollectionDto.attributes.map((attribute) => {
            this.attributeService.addColumnToTable(
              table,
              attribute,
              trx,
              createCollectionDto.name,
            );
          });
        });

        this.em.flush();
      });

      return {
        message: `Created collection : ${createCollectionDto.name}`,
      };
    } catch (error) {
      return new HttpException(error, HttpStatus.BAD_REQUEST);
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
}
