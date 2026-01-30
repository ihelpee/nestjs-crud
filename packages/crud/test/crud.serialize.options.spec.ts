import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { Controller, INestApplication, Inject } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';

import { Crud, Override, ParsedRequest } from '@ihelpee/crud';
import { CrudController, CrudRequest } from '@ihelpee/crud';
import { HttpExceptionFilter } from './__fixture__/exception.filter';
import { TestSerializeModel, TestSerialize2Model } from './__fixture__/models';
import {
  GetModelResponseDto,
  GetManyModelResponseDto,
  DeleteModelResponseDto,
  RecoverModelResponseDto,
} from './__fixture__/response';
import { TestSerializeService } from './__fixture__/services';

describe('#crud', () => {
  describe('#serialize options', () => {
    let app: INestApplication;
    let server: any;

    const SERVICE_TOKEN = 'TestSerializeServiceToken';
    const SERVICE2_TOKEN = 'TestSerializeServiceToken2';

    @Crud({
      model: {
        type: TestSerializeModel,
      },
      serialize: {
        get: GetModelResponseDto,
        delete: DeleteModelResponseDto,
      },
      routes: {
        deleteOneBase: {
          returnDeleted: true,
        },
      },
    })
    @Controller('test')
    class TestController {
      constructor(@Inject(SERVICE_TOKEN) public service: TestSerializeService) {}
    }

    @Crud({
      model: {
        type: TestSerialize2Model,
      },
      serialize: {
        get: GetModelResponseDto,
      },
      routes: {
        deleteOneBase: {
          returnDeleted: true,
        },
      },
      query: {
        alwaysPaginate: true,
      },
    })
    @Controller('test2')
    class Test2Controller {
      constructor(@Inject(SERVICE2_TOKEN) public service: TestSerializeService) {}
    }

    @Crud({
      model: {
        type: TestSerialize2Model,
      },
      serialize: {
        get: GetModelResponseDto,
        getMany: GetManyModelResponseDto,
      },
    })
    @Controller('test3')
    class Test3Controller implements CrudController<TestSerialize2Model> {
      constructor(@Inject(SERVICE2_TOKEN) public service: TestSerializeService) {}

      get base(): CrudController<TestSerialize2Model> {
        return this;
      }

      @Override()
      async getMany(@ParsedRequest() req: CrudRequest) {
        const items = (await this.base.getManyBase(req)) as TestSerialize2Model[];
        const response = new GetManyModelResponseDto();
        response.items = items;
        return response;
      }
    }

    @Crud({
      model: {
        type: TestSerialize2Model,
      },
    })
    @Controller('test4')
    class Test4Controller {
      constructor(@Inject(SERVICE2_TOKEN) public service: TestSerializeService) {}
    }

    @Crud({
      model: {
        type: { name: 'SomeModel' },
      },
      serialize: {
        get: false,
        getMany: false,
        create: false,
        createMany: false,
        update: false,
        replace: false,
        recover: false,
      },
    })
    @Controller('test5')
    class Test5Controller {
      constructor(@Inject(SERVICE2_TOKEN) public service: TestSerializeService) {}
    }

    @Crud({
      model: {
        type: TestSerializeModel,
      },
      serialize: {
        get: GetModelResponseDto,
        recover: RecoverModelResponseDto,
      },
      query: {
        softDelete: true,
      },
      routes: {
        recoverOneBase: {
          returnRecovered: true,
        },
      },
    })
    @Controller('test6')
    class Test6Controller {
      constructor(@Inject(SERVICE_TOKEN) public service: TestSerializeService) {}
    }

    beforeAll(async () => {
      const fixture = await Test.createTestingModule({
        controllers: [
          TestController,
          Test2Controller,
          Test3Controller,
          Test4Controller,
          Test5Controller,
          Test6Controller,
        ],
        providers: [
          { provide: APP_FILTER, useClass: HttpExceptionFilter },
          {
            provide: SERVICE_TOKEN,
            useFactory: () => new TestSerializeService(TestSerializeModel),
          },
          {
            provide: SERVICE2_TOKEN,
            useFactory: () => new TestSerializeService(TestSerialize2Model),
          },
        ],
      }).compile();

      app = fixture.createNestApplication();

      await app.init();
      server = app.getHttpServer();
    });

    afterAll(async () => {
      await app.close();
    });

    describe('#getManyBase', () => {
      it('should return an array', async () => {
        const res = await request(server).get('/test').expect(200);
        expect(res.body.length).toBe(5);
        expect(res.body[0].email).toBeUndefined();
        expect(res.body[1].email).toBeUndefined();
      });
      it('should return an object', async () => {
        const res = await request(server).get('/test2').expect(200);
        expect(res.body.data.length).toBe(5);
        expect(res.body.data[0].email).toBeUndefined();
        expect(res.body.data[1].email).toBeUndefined();
      });
      it('should return custom response', async () => {
        const res = await request(server).get('/test3').expect(200);
        expect(res.body.items.length).toBe(5);
        expect(res.body.items[0].email).toBeUndefined();
        expect(res.body.items[1].email).toBeUndefined();
      });
    });

    describe('#getOneBase', () => {
      it('should return model', async () => {
        const res = await request(server).get('/test4/1').expect(200);
        expect(res.body.email).toBeDefined();
        expect(res.body.isActive).toBeUndefined();
      });
      it('should return serialized model', async () => {
        const res = await request(server).get('/test/1').expect(200);
        expect(res.body.isActive).toBeDefined();
        expect(res.body.email).toBeUndefined();
      });
      it('should return model without serializing', async () => {
        const res = await request(server).get('/test5/1').expect(200);
        expect(res.body.id).toBeDefined();
        expect(res.body.name).toBeDefined();
        expect(res.body.email).toBeDefined();
        expect(res.body.isActive).toBeDefined();
      });
    });

    describe('#deleteManyBase', () => {
      it('should return serialized model', async () => {
        const res = await request(server).delete('/test/1').expect(200);
        expect(res.body.id).toBeDefined();
        expect(res.body.name).toBeUndefined();
        expect(res.body.email).toBeUndefined();
        expect(res.body.isActive).toBeUndefined();
      });
      it('should return model', async () => {
        const res = await request(server).delete('/test2/1').expect(200);
        expect(res.body.id).toBeDefined();
        expect(res.body.name).toBeDefined();
        expect(res.body.email).toBeDefined();
        expect(res.body.isActive).toBeUndefined();
      });
      it('should return en empty response', async () => {
        const res = await request(server).delete('/test3/1').expect(200);
        expect(res.body).toMatchObject({});
      });
    });

    describe('#recoverOneBase', () => {
      it('should return model', async () => {
        const res = await request(server).patch('/test6/1/recover').expect(200);
        expect(res.body.id).toBeDefined();
        expect(res.body.name).toBeDefined();
        expect(res.body.email).toBeDefined();
        expect(res.body.isActive).toBeDefined();
      });
      it('should return en empty response', async () => {
        const res = await request(server).patch('/test6/1/recover').expect(200);
        expect(res.body).toMatchObject({});
      });
    });
  });
});
