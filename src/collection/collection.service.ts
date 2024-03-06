import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { CreateObjectDto } from './dto/create-object.dto';
import { MikroORM } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import { UserService } from 'src/user/user.service';
import { CollectionMetadata } from './entities/collectionMetadata.entity';
import { User } from 'src/types/user';

@Injectable()
export class CollectionService {
  constructor(
    private readonly orm: MikroORM,
    private readonly em: EntityManager,
    private readonly userService: UserService,
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
        await trx.schema.createTable(
          createCollectionDto.name,
          function (table) {
            console.log(createCollectionDto.attributes, 'gg');
            table.increments('id').primary();
            table.integer('created_by').unsigned().references('cms_user.id');
            table.dateTime('created_at');
            table.dateTime('updated_at');

            createCollectionDto.attributes.map((attribute) => {
              if (attribute.type === 'string') {
                table.string(attribute.name);
              } else if (attribute.type === 'decimal') {
                table.decimal(attribute.name);
              } else if (attribute.type === 'integer') {
                table.integer(attribute.name);
              }
            });
          },
        );

        //Nemapovali sa ti polia entity na tabulku v db
        //Napr. collectionName sa nemapovalo na collection_name v db

        await trx('cms_collection_metadata').insert({
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
  async createObject(createObjectDto: CreateObjectDto, user: any) {
    console.log(createObjectDto);
    return 'a';

    // const newCustomObject = this.em.create(CustomType, {
    //   routeId: createObjectDto.routeId,
    //   attributes: createObjectDto.attributes,
    //   createdBy: user.id,
    //   changedBy: user.id,
    // });

    // const savedCustomObject = this.em.insert(CustomType, newCustomObject);

    // return savedCustomObject;
  }

  async getObjectData(objectId: number) {
    // const object = await this.em.findOne(CustomType, {
    //   id: objectId,
    // });
    // return object;
  }
  async getAllRoutes() {
    // const routes = await this.em.getRepository(Route).findAll();
    // return routes;
  }
  async deleteCollection(collectionName: string) {
    try {
      console.log(collectionName);
      const knex = this.em.getKnex();

      await knex.schema.dropTableIfExists(collectionName);

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
  async getRouteDataByName(routeName: string) {
    try {
      // const route = await this.em.findOneBy(Route, {
      //   name: routeName,
      // });
      // const objectData = await this.em
      //   .createQueryBuilder()
      //   .select()
      //   .from(route.name, null)
      //   .getRawMany();
      // return objectData;
    } catch (error) {
      throw new HttpException('Route not found', HttpStatus.NOT_FOUND);
    }
  }

  async getObjects(routeId: number) {
    // const objects = await this.em.find(CustomType, {
    //   routeId,
    // });
    // return objects;
  }
}
