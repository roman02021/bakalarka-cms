import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DataSource, Table } from 'typeorm';
import { Route } from './entities/route.entity';
import { CreateRouteDto } from './dto/create-route.dto';
import { CreateObjectDto } from './dto/create-object.dto';

@Injectable()
export class ApiService {
  constructor(private readonly dataSource: DataSource) {}
  async createRoute(createRouteDto: CreateRouteDto) {
    await this.dataSource.manager.transaction(
      async (transactionalEntityManager) => {
        try {
          const createdRoute = await this.dataSource
            .createQueryBuilder()
            .insert()
            .into(Route)
            .values({
              name: createRouteDto.name,
              pluralName: 'test',
              attributes: createRouteDto.attributes.map((x) => x),
              createdBy: 123,
              changedBy: 123,
            })
            .execute();

          await this.dataSource.createQueryRunner().createTable(
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
          console.log(createdRoute);
          return createdRoute;
        } catch (error) {
          throw new HttpException(
            'Route already exists.',
            HttpStatus.BAD_REQUEST,
            { cause: error },
          );
        }
      },
    );
  }
  async createObject(createObjectDto: CreateObjectDto) {
    const route = await this.dataSource.manager.findOneBy(Route, {
      id: createObjectDto.route_id,
    });

    const attributes = Object.fromEntries(
      createObjectDto.attributes.map((item) => [item.name, item.value]),
    );

    const createdObject = await this.dataSource
      .createQueryBuilder()
      .insert()
      .into(route.name)
      .values(attributes)
      .execute();

    return createdObject;
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
}
