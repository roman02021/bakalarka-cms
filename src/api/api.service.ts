import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DataSource, Table } from 'typeorm';
import { Route } from './entities/route.entity';
import { CreateRouteDto } from './dto/create-route.dto';
import { CreateObjectDto } from './dto/create-object.dto';
import { DeleteObjectDto } from './dto/delete-object.dto';

@Injectable()
export class ApiService {
  constructor(private readonly dataSource: DataSource) {}
  async createRoute(createRouteDto: CreateRouteDto, user: any) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const savedRoute = await queryRunner.manager.save(Route, {
        name: createRouteDto.name,
        pluralName: 'test',
        attributes: createRouteDto.attributes.map((x) => x),
        createdBy: user.id,
        changedBy: user.id,
        amountOfObjects: 0,
      });

      await queryRunner.createTable(
        new Table({
          name: createRouteDto.name,
          columns: [
            {
              name: 'id',
              type: 'int',
              isPrimary: true,
              isGenerated: true,
            },
            ...createRouteDto.attributes.map((x) => x),
          ],
        }),
      );
      await queryRunner.commitTransaction();

      return savedRoute;
    } catch (error) {
      throw new HttpException('Route already exists.', HttpStatus.BAD_REQUEST, {
        cause: error,
      });
    }
  }
  async createObject(createObjectDto: CreateObjectDto) {
    const route = await this.dataSource.manager.findOneBy(Route, {
      id: createObjectDto.route_id,
    });

    const attributes = Object.fromEntries(
      createObjectDto.attributes.map((item) => [item.name, item.value]),
    );

    await this.dataSource
      .createQueryBuilder()
      .insert()
      .into(route.name)
      .values(attributes)
      .execute();

    await this.dataSource
      .getRepository(Route)
      .createQueryBuilder()
      .update(Route)
      .set({ amountOfObjects: () => 'amountOfObjects + 1' })
      .where('id = :id', { id: route.id })
      .execute();

    return 'Inserted sucessfuly.';
  }

  async getObjectData(routeId: number) {
    const route = await this.dataSource.manager.findOneBy(Route, {
      id: routeId,
    });

    const objectData = await this.dataSource.manager
      .createQueryBuilder()
      .select()
      .from(route.name, null)
      .getRawMany();

    return objectData;
  }
  async getAllRoutes() {
    const routes = await this.dataSource.manager.getRepository(Route).find();

    return routes;
  }
  async deleteObject(deleteObjectDto: DeleteObjectDto) {
    try {
      const route = await this.dataSource.manager.findOneBy(Route, {
        name: deleteObjectDto.name,
      });

      if (!route) {
        return new HttpException(
          'No route with given name was found.',
          HttpStatus.NOT_FOUND,
        );
      }

      const queryResult = await this.dataSource.manager
        .createQueryBuilder()
        .delete()
        .from(route.name, null)
        .where('id = :id', { id: route.id })
        .delete()
        .execute();

      if (queryResult.affected > 0) {
        return `Object ${deleteObjectDto.name} ${deleteObjectDto.objectId} was deleted`;
      } else {
        return `No object with given id exists within the collection.`;
      }
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
      const route = await this.dataSource.manager.findOneBy(Route, {
        name: routeName,
      });
      const objectData = await this.dataSource.manager
        .createQueryBuilder()
        .select()
        .from(route.name, null)
        .getRawMany();

      return objectData;
    } catch (error) {
      throw new HttpException('Route not found', HttpStatus.NOT_FOUND);
    }
  }
}
