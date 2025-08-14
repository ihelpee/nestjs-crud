import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { Controller, INestApplication } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { RequestQueryBuilder } from '@ihelpee/crud-request';

import { Crud } from '../src/decorators/crud.decorator';
import { CreateManyDto } from '../src/interfaces';
import { HttpExceptionFilter } from './__fixture__/exception.filter';
import { TestModel } from './__fixture__/models';
import { TestService } from './__fixture__/services';

describe('#crud', () => {
  describe('#base methods', () => {
    let app: INestApplication;
    let server: any;
    let qb: RequestQueryBuilder;

    @Crud({
      model: { type: TestModel },
    })
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

    beforeEach(() => {
      qb = RequestQueryBuilder.create();
    });

    afterAll(async () => {
      app.close();
    });

    describe('#getManyBase', () => {
      it('should return status 200', async () => {
        await request(server).get('/test').expect(200);
      });
      it('should return status 400', async () => {
        const query = qb.setFilter({ field: 'foo', operator: 'gt' }).query();
        const res = await request(server).get('/test').query(query);
        const expected = { statusCode: 400, message: 'Invalid filter value' };
        expect(res.status).toEqual(400);
        expect(res.body).toMatchObject(expected);
      });
    });

    describe('#getOneBase', () => {
      it('should return status 200', async () => {
        await request(server).get('/test/1').expect(200);
      });
      it('should return status 400', async () => {
        const res = await request(server).get('/test/invalid');
        const expected = {
          statusCode: 400,
          message: 'Invalid param id. Number expected',
        };
        expect(res.status).toEqual(400);
        expect(res.body).toMatchObject(expected);
      });
    });

    describe('#createOneBase', () => {
      it('should return status 201', async () => {
        const send: TestModel = {
          firstName: 'firstName',
          lastName: 'lastName',
          email: 'test@test.com',
          age: 15,
        };
        await request(server).post('/test').send(send).expect(201);
      });
      it('should return status 400', async () => {
        const send: TestModel = {
          firstName: 'firstName',
          lastName: 'lastName',
          email: 'test@test.com',
        };
        const res = await request(server).post('/test').send(send);
        expect(res.status).toEqual(400);
      });
    });

    describe('#createMadyBase', () => {
      it('should return status 201', async () => {
        const send: CreateManyDto<TestModel> = {
          bulk: [
            {
              firstName: 'firstName',
              lastName: 'lastName',
              email: 'test@test.com',
              age: 15,
            },
            {
              firstName: 'firstName',
              lastName: 'lastName',
              email: 'test@test.com',
              age: 15,
            },
          ],
        };
        await request(server).post('/test/bulk').send(send).expect(201);
      });
      it('should return status 400', async () => {
        const send: CreateManyDto<TestModel> = {
          bulk: [],
        };
        const res = await request(server).post('/test/bulk').send(send);
        expect(res.status).toEqual(400);
      });
    });

    describe('#replaceOneBase', () => {
      it('should return status 200', async () => {
        const send: TestModel = {
          id: 1,
          firstName: 'firstName',
          lastName: 'lastName',
          email: 'test@test.com',
          age: 15,
        };
        await request(server).put('/test/1').send(send).expect(200);
      });
      it('should return status 400', async () => {
        const send: TestModel = {
          firstName: 'firstName',
          lastName: 'lastName',
          email: 'test@test.com',
        };
        const res = await request(server).put('/test/1').send(send);
        expect(res.status).toEqual(400);
      });
    });

    describe('#updateOneBase', () => {
      it('should return status 200', async () => {
        const send: TestModel = {
          id: 1,
          firstName: 'firstName',
          lastName: 'lastName',
          email: 'test@test.com',
          age: 15,
        };
        await request(server).patch('/test/1').send(send).expect(200);
      });
      it('should return status 400', async () => {
        const send: TestModel = {
          firstName: 'firstName',
          lastName: 'lastName',
          email: 'test@test.com',
        };
        const res = await request(server).patch('/test/1').send(send);
        expect(res.status).toEqual(400);
      });
    });

    describe('#deleteOneBase', () => {
      it('should return status 200', async () => {
        await request(server).delete('/test/1').expect(200);
      });
    });
  });
});
