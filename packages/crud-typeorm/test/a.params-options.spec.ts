import { Controller, INestApplication } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as request from 'supertest';
import { faker } from '@faker-js/faker';

import { Company } from '../../../integration/crud-typeorm/companies';
import { isPg, postgresConfig, mySqlConfig } from '../../../database';
import { Project } from '../../../integration/crud-typeorm/projects';
import { User } from '../../../integration/crud-typeorm/users';
import { UserProfile } from '../../../integration/crud-typeorm/users-profiles';
import { HttpExceptionFilter } from '../../../integration/shared/https-exception.filter';
import { Crud } from '@ihelpee/crud';
import { UsersService } from './__fixture__/users.service';

jest.setTimeout(60000);

describe('#crud-typeorm', () => {
  const withCache = isPg ? postgresConfig : mySqlConfig;

  describe('#params options', () => {
    let app: INestApplication;
    let server: any;

    @Crud({
      model: { type: User },
      params: {
        companyId: {
          field: 'companyId',
          type: 'number',
        },
        id: {
          field: 'id',
          type: 'number',
          primary: true,
        },
      },
      routes: {
        updateOneBase: {
          allowParamsOverride: true,
          returnShallow: true,
        },
        replaceOneBase: {
          allowParamsOverride: true,
          returnShallow: true,
        },
      },
    })
    @Controller('/companiesA/:companyId/users')
    class UsersController1 {
      constructor(public service: UsersService) {}
    }

    @Crud({
      model: { type: User },
      params: {
        companyId: {
          field: 'companyId',
          type: 'number',
        },
        id: {
          field: 'id',
          type: 'number',
          primary: true,
        },
      },
      query: {
        join: {
          company: {
            eager: true,
          },
        },
      },
    })
    @Controller('/companiesB/:companyId/users')
    class UsersController2 {
      constructor(public service: UsersService) {}
    }

    beforeAll(async () => {
      const fixture = await Test.createTestingModule({
        imports: [
          TypeOrmModule.forRoot({ ...withCache, logging: false }),
          TypeOrmModule.forFeature([Company, Project, User, UserProfile]),
        ],
        controllers: [UsersController1, UsersController2],
        providers: [{ provide: APP_FILTER, useClass: HttpExceptionFilter }, UsersService],
      }).compile();

      app = fixture.createNestApplication();

      await app.init();
      server = app.getHttpServer();
    });

    afterAll(async () => {
      await app.close();
    });

    describe('#updateOneBase', () => {
      it('should override params', async () => {
        const dto = { isActive: false, companyId: 2 };

        const user = await request(server)
          .post('/companiesA/1/users')
          .send({
            companyId: dto.companyId,
            isActive: faker.datatype.boolean(),
            email: faker.internet.email(),
            name: {
              first: faker.person.firstName(),
              last: faker.person.lastName(),
            },
          });

        const res = await request(server)
          .patch(`/companiesA/1/users/${user.body.id}`)
          .send(dto)
          .expect(200);
        expect(res.body.companyId).toBe(dto.companyId);
      });

      it('should not override params', async () => {
        const dto = { isActive: false, companyId: 2 };

        const resp = await request(server)
          .post('/companiesA/1/users')
          .send({
            isActive: faker.datatype.boolean(),
            email: faker.internet.email(),
            name: {
              first: faker.person.firstName(),
              last: faker.person.lastName(),
            },
          });

        const res = await request(server)
          .patch(`/companiesB/1/users/${resp.body.id}`)
          .send(dto)
          .expect(200);
        expect(res.body.companyId).toBe(1);
      });

      it('should return full entity', async () => {
        const dto = { isActive: false };

        const resp = await request(server)
          .post('/companiesA/2/users')
          .send({
            isActive: faker.datatype.boolean(),
            email: faker.internet.email(),
            name: {
              first: faker.person.firstName(),
              last: faker.person.lastName(),
            },
          });

        const res = await request(server)
          .patch(`/companiesB/2/users/${resp.body.id}`)
          .send(dto)
          .expect(200);
        expect(res.body.company.id).toBe(2);
      });

      it('should return shallow entity', async () => {
        const dto = { isActive: false, companyId: 2 };

        const resp = await request(server)
          .post('/companiesA/2/users')
          .send({
            isActive: faker.datatype.boolean(),
            email: faker.internet.email(),
            name: {
              first: faker.person.firstName(),
              last: faker.person.lastName(),
            },
          });

        const res = await request(server)
          .patch(`/companiesA/2/users/${resp.body.id}`)
          .send(dto)
          .expect(200);
        expect(res.body.company).toBeUndefined();
      });
    });

    describe('#replaceOneBase', () => {
      it('should override params', async () => {
        const dto = { isActive: false, companyId: 2, email: '4@email.com' };

        const resp = await request(server)
          .post('/companiesA/3/users')
          .send({
            isActive: faker.datatype.boolean(),
            email: faker.internet.email(),
            name: {
              first: faker.person.firstName(),
              last: faker.person.lastName(),
            },
          });

        const res = await request(server)
          .put(`/companiesA/1/users/${resp.body.id}`)
          .send(dto)
          .expect(200);
        expect(res.body.companyId).toBe(2);
      });

      it('should not override params', async () => {
        const dto = { isActive: false, companyId: 1 };

        const resp = await request(server)
          .post('/companiesA/2/users')
          .send({
            isActive: faker.datatype.boolean(),
            email: faker.internet.email(),
            name: {
              first: faker.person.firstName(),
              last: faker.person.lastName(),
            },
          });

        const res = await request(server)
          .put(`/companiesB/2/users/${resp.body.id}`)
          .send(dto)
          .expect(200);
        expect(res.body.companyId).toBe(2);
      });

      it('should return full entity', async () => {
        const dto = { isActive: false };

        const resp = await request(server)
          .post('/companiesA/2/users')
          .send({
            isActive: faker.datatype.boolean(),
            email: faker.internet.email(),
            name: {
              first: faker.person.firstName(),
              last: faker.person.lastName(),
            },
          });

        const res = await request(server)
          .put(`/companiesB/2/users/${resp.body.id}`)
          .send(dto)
          .expect(200);
        expect(res.body.company.id).toBe(2);
      });

      it('should return shallow entity', async () => {
        const dto = { isActive: false, companyId: 2 };
        const resp = await request(server)
          .post('/companiesA/2/users')
          .send({
            isActive: faker.datatype.boolean(),
            email: faker.internet.email(),
            name: {
              first: faker.person.firstName(),
              last: faker.person.lastName(),
            },
          });
        const res = await request(server)
          .put(`/companiesA/2/users/${resp.body.id}`)
          .send(dto)
          .expect(200);
        expect(res.body).toEqual(
          expect.objectContaining({
            companyId: 2,
          }),
        );
      });
    });
  });
});
