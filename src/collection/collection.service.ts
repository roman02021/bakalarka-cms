import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Route } from './entities/route.entity';
import { CustomType } from './entities/customType.entity';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { CreateObjectDto } from './dto/create-object.dto';
import { DeleteObjectDto } from './dto/delete-object.dto';
import { MikroORM } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import { UserService } from 'src/user/user.service';

@Injectable()
export class CollectionService {
  constructor(
    private readonly orm: MikroORM,
    private readonly em: EntityManager,
    private readonly userService: UserService,
  ) {}
  async createCollection(createCollectionDto: CreateCollectionDto, user: any) {
    try {
      console.log(createCollectionDto);

      const knex = this.em.getKnex();

      await knex.schema.createTable(createCollectionDto.name, function (table) {
        console.log(createCollectionDto.attributes, 'gg');
        table.increments('id').primary();
        table.integer('created_by').unsigned().references('users.id');
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
      });

      return `Created collection : ${createCollectionDto.name}`;
      // const route = this.em.create(Route, {
      //   ...createRouteDto,
      //   attributeSchema: createRouteDto.attributes.map((x) => x),
      //   createdBy: user.id,
      //   changedBy: user.id,
      // });

      // await this.em.insert(Route, route);

      // return route;
    } catch (error) {
      console.log(error);
      return new HttpException(
        'Route already exists.',
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
    const object = await this.em.findOne(CustomType, {
      id: objectId,
    });

    return object;
  }
  async getAllRoutes() {
    const routes = await this.em.getRepository(Route).findAll();

    return routes;
  }
  async deleteObject(deleteObjectDto: DeleteObjectDto) {
    try {
      const object = await this.em.findOne(
        CustomType,
        deleteObjectDto.objectId,
      );

      const removedObject = this.em.remove(object);

      return removedObject;
    } catch (error) {
      return new HttpException(
        error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
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
    const objects = await this.em.find(CustomType, {
      routeId,
    });

    return objects;
  }
}
