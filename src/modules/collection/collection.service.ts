import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { EntityManager } from '@mikro-orm/postgresql';
import { User } from 'src/types/user';
import { Collection } from './entities/collection.entity';
import { AttributeService } from '../attribute/attribute.service';
import { MikroORM } from '@mikro-orm/core';
import { Attribute } from '../attribute/entities/attribute.entity';

@Injectable()
export class CollectionService {
  constructor(
    private readonly em: EntityManager,
    private readonly attributeService: AttributeService,
    private readonly orm: MikroORM,
  ) {}
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

        // const collection = await trx('cms_collections').insert<Collection>(
        //   newCollection,
        // );

        // const collection = await trx(this.em.getMetadata(Collection).tableName)
        //   .insert({
        //     name: createCollectionDto.name,
        //     created_by: user.id,
        //     created_at: new Date(),
        //     updated_at: new Date(),
        //     display_name: createCollectionDto.displayName,
        //   })
        //   .returning('*');

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
          console.log(attribute.relationType);
          if (attribute.relationType === 'manyToMany') {
            // const referencedCollection = await this.em.findOneOrFail(
            //   Collection,
            //   { name: attribute.referencedTable },
            // );

            //you need to use knex here because mikroorm flushes when finding a managed entitiy
            const referencedCollection = await trx('cms_collections').where(
              'name',
              attribute.referencedTable,
            );

            //
            const referencedTableRelationAttribute = new Attribute(
              newCollection.displayName,
              newCollection.name,
              attribute.type,
              referencedCollection[0].id,
              attribute.isRequired,
              attribute.relationType,
              attribute.referencedColumn,
              newCollection.name,
            );
            console.log(newAttribute, 'RERFERENCED ATTr');
            this.em.persist(referencedTableRelationAttribute);
          }
          // await trx('cms_attributes').insert<Attribute>(newAttribute);
        }
        // await Promise.all(
        //   createCollectionDto.attributes.map(async (attribute) => {
        //     const newAttribute = new Attribute(
        //       attribute.displayName,
        //       attribute.name,
        //       attribute.type,
        //       collection[0].id,
        //       attribute.isRequired,
        //       attribute.relationType,
        //       attribute.referencedColumn,
        //       attribute.referencedTable,
        //     );
        //     await trx('cms_attributes').insert<Attribute>(newAttribute);
        //   }),
        // );

        //create a new table with provided columns (attributes/relations)
        await trx.schema.createTable(createCollectionDto.name, (table) => {
          // console.log('CREATING', table);
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

        // await trx.schema.alterTable(createCollectionDto.name, (table) => {
        //   for (const attribute of createCollectionDto.attributes) {
        //     this.attributeService.addColumnToTable(
        //       table,
        //       attribute,
        //       trx,
        //       createCollectionDto.name,
        //     );
        //   }
        // });

        this.em.flush();

        //Nemapovali sa ti polia entity na tabulku v db
        //Napr. collectionName sa nemapovalo na collection_name v db
      });

      return {
        message: `Created collection : ${createCollectionDto.name}`,
      };
    } catch (error) {
      console.log(error);
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

        console.log('DELETING', collectionName);

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
