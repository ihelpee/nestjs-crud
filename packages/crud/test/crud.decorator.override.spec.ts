import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { Controller, INestApplication } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { RequestQueryBuilder } from '@ihelpee/crud-request';
import { CrudActions, ParsedBody, ParsedRequest } from '../src';

import { Crud, Override } from '../src/decorators';
import { CrudController, CrudRequest, CreateManyDto } from '../src/interfaces';
import { R, Swagger } from '../src/crud';
import { HttpExceptionFilter } from './__fixture__/exception.filter';
import { TestModel } from './__fixture__/models';
import { TestService } from './__fixture__/services';

describe('#crud', () => {
  describe('#override methods', () => {
    let app: INestApplication;
    let server: any;
    let qb: RequestQueryBuilder;

    enum Field {
      ONE = 'one',
    }

    @Crud({
      model: { type: TestModel },
      params: {
        enumField: {
          field: 'enum_field',
          type: 'string',
          enum: Field,
        },
        disabledField: {
          field: 'disabled_field',
          type: 'number',
          disabled: true,
        },
      },
    })
    @Controller('test')
    class TestController implements CrudController<TestModel> {
      constructor(public service: TestService<TestModel>) {}

      get base(): CrudController<TestModel> {
        return this;
      }

      @Override()
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      getMany(@ParsedRequest() req: CrudRequest) {
        return { foo: 'bar' };
      }

      @Override('createManyBase')
      createBulk(
        @ParsedBody() dto: CreateManyDto<TestModel>,
        @ParsedRequest() req: CrudRequest,
      ) {
        return this.base.createManyBase(req, dto);
      }
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
      await app.close();
    });

    describe('#override getMany', () => {
      it('should return status 200', async () => {
        const res = await request(server).get('/test').expect(200);
        const expected = { foo: 'bar' };
        expect(res.body).toMatchObject(expected);
      });
      it('should return status 400', async () => {
        const query = qb.setFilter({ field: 'foo', operator: 'gt' }).query();
        const res = await request(server).get('/test').query(query);
        const expected = { statusCode: 400, message: 'Invalid filter value' };
        expect(res.status).toEqual(400);
        expect(res.body).toMatchObject(expected);
      });
      it('should have action metadata', () => {
        const action = R.getAction(TestController.prototype.getMany);
        expect(action).toBe(CrudActions.ReadAll);
      });
      it('should return swagger operation', () => {
        const operation = Swagger.getOperation(TestController.prototype.getMany);
        const expected = { summary: 'Retrieve multiple TestModel' };
        expect(operation).toMatchObject(expected);
      });
      it('should return swagger params', () => {
        const params = Swagger.getParams(TestController.prototype.getMany);
        expect(Array.isArray(params)).toBe(true);
        expect(params.length > 0).toBe(true);

        const enumParam = params.find((param) => param.name === 'enumField');
        expect(enumParam).toBeDefined();
        expect(enumParam.enum).toEqual(['one']);
      });
      it('should not return disabled fields in swagger', () => {
        const params = Swagger.getParams(TestController.prototype.getMany);
        expect(Array.isArray(params)).toBe(true);
        expect(params.length > 0).toBe(true);

        const disabledParam = params.find((param) => param.name === 'disabledField');
        expect(disabledParam).toBeUndefined();
      });
      it('should return swagger response ok', () => {
        const response = Swagger.getResponseOk(TestController.prototype.getMany);
        const expected = {
          '200': {
            type: expect.any(Function),
          },
        };
        expect(response).toMatchObject(expected);
      });
    });

    describe('#override createMany', () => {
      it('should still validate dto', async () => {
        const send: CreateManyDto<TestModel> = {
          bulk: [],
        };
        const res = await request(server).post('/test/bulk').send(send);
        expect(res.status).toEqual(400);
      });
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
        const res = await request(server).post('/test/bulk').send(send).expect(201);
        expect(res.body).toHaveProperty('req');
        expect(res.body).toHaveProperty('dto');
        expect(res.body.dto).toMatchObject(send);
      });
    });
  });
});
