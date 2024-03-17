import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { EntityManager } from '@mikro-orm/postgresql';
import { User } from 'src/types/user';
import { CollectionMetadata } from './entities/collectionMetadata.entity';
import { AttributeService } from '../attribute/attribute.service';

@Injectable()
export class CollectionService {
  constructor(
    private readonly em: EntityManager,
    private readonly attributeService: AttributeService,
  ) {}
  async createCollection(createCollectionDto: CreateCollectionDto, user: User) {
    try {
      const knex = this.em.getKnex();

      if (await knex.schema.hasTable(createCollectionDto.name)) {
        return new HttpException(
          'Route already exists.',
          HttpStatus.BAD_REQUEST,
        );
      }

      await knex.transaction(async (trx) => {
        await trx.schema.createTable(createCollectionDto.name, (table) => {
          table.increments('id').primary();
          table.integer('created_by').unsigned().references('cms_users.id');
          table.timestamps(true, true);

          createCollectionDto.attributes.map((attribute) => {
            this.attributeService.addColumnToTable(table, attribute);
          });
        });

        //Nemapovali sa ti polia entity na tabulku v db
        //Napr. collectionName sa nemapovalo na collection_name v db

        await trx(this.em.getMetadata(CollectionMetadata).tableName).insert({
          collection_name: createCollectionDto.name,
          created_by: user.id,
          created_at: new Date(),
          updated_at: new Date(),
          display_name: createCollectionDto.displayName,
        });
      });

      return `Created collection : ${createCollectionDto.name}`;
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
  async getAllCollections() {
    const collections = await this.em
      .createQueryBuilder(CollectionMetadata)
      .select('*');

    return collections;
  }
  async deleteCollection(collection: string) {
    try {
      const knex = this.em.getKnex();

      await knex.transaction(async (trx) => {
        await trx.schema.dropTableIfExists(collection);

        await trx(this.em.getMetadata(CollectionMetadata).tableName)
          .where('collection_name', collection)
          .del();
      });

      return `Collection deleted: ${collection}`;
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
