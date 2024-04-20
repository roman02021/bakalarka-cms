import { Test, TestingModule } from '@nestjs/testing';
import { ItemsController } from './item.controller';
import { ItemsService } from './item.service';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';

import { RelationsService } from '../../relations/relations.service';
import { ItemsModule } from './item.module';
import { AuthService } from '../auth/auth.service';
import { AuthModule } from '../auth/auth.module';

const moduleMocker = new ModuleMocker(global);

describe('ItemsController', () => {
  let itemsController: ItemsController;
  let itemsService: ItemsService;
  let relationsService: RelationsService;
  // let em: EntityManager;
  //   let entityManager: EntityManager;
  //   let relationsService: RelationsService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [ItemsController],
    })
      .useMocker((token) => {
        if (token === ItemsService) {
          return { findAll: jest.fn().mockResolvedValue('cock') };
        }
        if (typeof token === 'function') {
          const mockMetadata = moduleMocker.getMetadata(
            token,
          ) as MockFunctionMetadata<any, any>;
          const Mock = moduleMocker.generateFromMetadata(mockMetadata);
          return new Mock();
        }
      })
      .compile();

    // itemsService = moduleRef.get<ItemsService>(ItemsService);
    itemsController = moduleRef.get<ItemsController>(ItemsController);
    // relationsService = moduleRef.get<RelationsService>(RelationsService);
  });

  describe('getItems', () => {
    it('should return an array of items', async () => {
      console.log('coca');
      return true;
    });
  });
});
