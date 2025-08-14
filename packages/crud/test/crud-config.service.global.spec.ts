import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { Controller, INestApplication } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';

import { CrudConfigService } from '../src/module/crud-config.service';

// IMPORTANT:
// CrudConfigService.load() should be called before importing @Crud() controllers

const conf = {
  query: {
    limit: 10,
  },
  params: {
    id: {
      field: 'id',
      type: 'uuid',
      primary: true,
    },
  },
  routes: {
    exclude: ['createManyBase'],
    updateOneBase: {
      allowParamsOverride: true,
    },
    replaceOneBase: {
      allowParamsOverride: true,
    },
  },
  serialize: {
    get: false,
  },
};

// Important: load config before (!!!) you import AppModule
CrudConfigService.load(conf as any);

import { Crud } from '../src/decorators/crud.decorator';
import { HttpExceptionFilter } from './__fixture__/exception.filter';
import { TestModel } from './__fixture__/models';
import { TestService } from './__fixture__/services';

describe('#crud', () => {
  describe('#CrudConfigService', () => {
    let app: INestApplication;
    let server: any;

    @Crud({
      model: { type: TestModel },
    })
    @Controller('test')
    class GlobalTestController {
      constructor(public service: TestService<TestModel>) {}
    }

    @Crud({
      model: { type: TestModel },
      query: {
        limit: 12,
      },
      params: {
        id: {
          field: 'id',
          type: 'number',
          primary: true,
        },
      },
      routes: {
        updateOneBase: {
          allowParamsOverride: false,
        },
        replaceOneBase: {
          allowParamsOverride: false,
        },
        deleteOneBase: {
          returnDeleted: true,
        },
      },
    })
    @Controller('test2')
    class GlobalTestController2 {
      constructor(public service: TestService<TestModel>) {}
    }

    beforeAll(async () => {
      const fixture = await Test.createTestingModule({
        controllers: [GlobalTestController, GlobalTestController2],
        providers: [{ provide: APP_FILTER, useClass: HttpExceptionFilter }, TestService],
      }).compile();

      app = fixture.createNestApplication();

      await app.init();
      server = app.getHttpServer();
    });

    afterAll(async () => {
      await app.close();
    });

    it('should use global config', async () => {
      const res = await request(server).get('/test');

      expect(res.status).toBe(200);
      expect(res.body.req.options.query).toMatchObject(conf.query);
      expect(res.body.req.options.params).toMatchObject(conf.params);
      expect(res.body.req.options.routes.updateOneBase.allowParamsOverride).toBe(true);
      expect(res.body.req.options.routes.replaceOneBase.allowParamsOverride).toBe(true);
    });
    it('should use merged config', async () => {
      const res = await request(server).get('/test2');
      expect(res.status).toBe(200);
      expect(res.body.req.options.query).toMatchObject({
        limit: 12,
      });
      expect(res.body.req.options.params).toMatchObject({
        id: {
          field: 'id',
          type: 'number',
          primary: true,
        },
      });
      expect(res.body.req.options.routes.updateOneBase.allowParamsOverride).toBe(false);
      expect(res.body.req.options.routes.replaceOneBase.allowParamsOverride).toBe(false);
      expect(res.body.req.options.routes.deleteOneBase.returnDeleted).toBe(true);
    });
    it('should exclude route, 1', async () => {
      const res = await request(server).post('/test/bulk').send({});
      expect(res.status).toBe(404);
    });
    it('should exclude route, 1', async () => {
      const res = await request(server).post('/test2/bulk').send({});
      expect(res.status).toBe(404);
    });
  });
});
