import { Test, TestingModule } from '@nestjs/testing';
import { ItemsController } from './item.controller';
import { ItemsService } from './item.service';
import { EntityManager, PostgreSqlDriver } from '@mikro-orm/postgresql';

import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';

describe('ItemsController', () => {
  let itemsController: ItemsController;
  let itemsService: ItemsService;
  let em: EntityManager;
  //   let entityManager: EntityManager;
  //   let relationsService: RelationsService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ItemsController],
      providers: [ItemsService],
    }).compile();

    itemsService = moduleRef.get<ItemsService>(ItemsService);
    itemsController = moduleRef.get<ItemsController>(ItemsController);
    em = moduleRef.get<EntityManager>(EntityManager);
  });

  describe('getItems', () => {
    it('should return an array of items', async () => {
      const result = [''];

      const items = itemsService.getItems('article', []);
      console.log(items, 'in test');
    });
  });
});
