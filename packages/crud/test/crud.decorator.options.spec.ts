import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { Controller, INestApplication } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { CrudRoutesFactory } from '../src/crud/crud-routes.factory';
import { Swagger } from '../src/crud/swagger.helper';
import { Crud } from '../src/decorators';
import { HttpExceptionFilter } from './__fixture__/exception.filter';
import { TestModel } from './__fixture__/models';
import { TestService } from './__fixture__/services';
import { BaseRouteName } from '../src';

describe('#crud', () => {
  describe('#options', () => {
    let app: INestApplication;
    let server: any;

    class CustomSwaggerRoutesFactory extends CrudRoutesFactory {
      protected setSwaggerOperation(name: BaseRouteName) {
        const summary = Swagger.operationsMap(this.modelName)[name];
        const operationId = '_' + name + this.modelName;
        Swagger.setOperation({ summary, operationId }, this.targetProto[name]);
      }
    }

    const options = {
      model: { type: TestModel },
      params: {
        id: {
          field: 'id',
          type: 'uuid',
          primary: true,
        },
      },
      query: {
        limit: 10,
      },
      routes: {
        getManyBase: {
          interceptors: [],
          decorators: [],
        },
        getOneBase: {
          interceptors: [],
          decorators: [],
        },
        createOneBase: {
          interceptors: [],
          decorators: [],
        },
        createManyBase: {
          interceptors: [],
          decorators: [],
        },
        updateOneBase: {
          interceptors: [],
          decorators: [],
          allowParamsOverride: true,
        },
        replaceOneBase: {
          interceptors: [],
          decorators: [],
          allowParamsOverride: true,
        },
        deleteOneBase: {
          interceptors: [],
          decorators: [],
          returnDeleted: true,
        },
      },
      routesFactory: CustomSwaggerRoutesFactory,
    };

    @Crud(options as any)
    @Controller('test')
    class TestController {
      constructor(public service: TestService<TestModel>) {}
    }

    beforeAll(async () => {
      const fixture = await Test.createTestingModule({
        controllers: [TestController],
        providers: [{ provide: APP_FILTER, useClass: HttpExceptionFilter }, TestService],
      }).compile();

      app = fixture.createNestApplication();

      await app.init();
      server = app.getHttpServer();
    });

    afterAll(async () => {
      await app.close();
    });

    it('should return options in ParsedRequest', async () => {
      const res = await request(server).get('/test').expect(200);
      const opt = res.body.req.options;
      expect(opt.query).toMatchObject(options.query);
      expect(opt.routes).toMatchObject(options.routes);
      expect(opt.params).toMatchObject(options.params);
    });

    it('should use crudRoutesFactory override', () => {
      const testController: any = app.get<TestController>(TestController);
      const { operationId } = Swagger.getOperation(testController.replaceOneBase);
      expect(operationId).toEqual('_replaceOneBaseTestModel');
    });
  });
});
