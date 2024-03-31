import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { EntityManager } from '@mikro-orm/postgresql';
import { User } from 'src/types/user';
import { Collection } from './entities/collection.entity';
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
          'Collection already exists.',
          HttpStatus.BAD_REQUEST,
        );
      }

      await knex.transaction(async (trx) => {
        const collection = await trx(
          this.em.getMetadata(Collection).tableName,
        ).insert({
          name: createCollectionDto.name,
          created_by: user.id,
          created_at: new Date(),
          updated_at: new Date(),
          display_name: createCollectionDto.displayName,
        });

        console.log(collection, 'yo');

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
  async getCollectionById(collectionId: number) {
    const collections = await this.em.findOneOrFail(Collection, collectionId);

    console.log(collections);

    return collections;
  }
  async getAllCollections() {
    const collections = await this.em
      .createQueryBuilder(Collection)
      .select('*');

    console.log(collections);

    return collections;
  }
  async deleteCollection(collectionId: number) {
    try {
      const knex = this.em.getKnex();

      const collection = await this.em.findOneOrFail(Collection, collectionId);

      console.log(collection, 'yooo');

      await knex.transaction(async (trx) => {
        await trx.schema.dropTableIfExists(collection.name);

        console.log(this.em.getMetadata(Collection).tableName);

        await trx(this.em.getMetadata(Collection).tableName)
          .where('name', collection.name)
          .del();
      });

      return `Collection deleted: ${collection.name}`;
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
