import { Controller, INestApplication } from '@nestjs/common';
import { faker } from '@faker-js/faker';
import { APP_FILTER } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestQueryBuilder } from '@ihelpee/crud-request';
import * as request from 'supertest';

import { Company } from '../../../integration/crud-typeorm/companies';
import { Note } from '../../../integration/crud-typeorm/notes';
import { isPg, postgresConfig, mySqlConfig } from '../../../database';
import { Project } from '../../../integration/crud-typeorm/projects';
import { User } from '../../../integration/crud-typeorm/users';
import { UserProfile } from '../../../integration/crud-typeorm/users-profiles';
import { HttpExceptionFilter } from '../../../integration/shared/https-exception.filter';
import { Crud } from '@ihelpee/crud';
import { CompaniesService } from './__fixture__/companies.service';
import { NotesService } from './__fixture__/notes.service';
import { ProjectsService } from './__fixture__/projects.service';
import { UsersService, UsersService2 } from './__fixture__/users.service';
import { UserProfilesService } from './__fixture__/UserProfile.service';

jest.setTimeout(60000);

describe('#crud-typeorm', () => {
  const withCache = isPg ? postgresConfig : mySqlConfig;

  describe('#query params', () => {
    let app: INestApplication;
    let server: any;
    let qb: RequestQueryBuilder;

    @Crud({
      model: { type: Company },
      query: {
        exclude: ['updatedAt'],
        allow: ['id', 'name', 'domain', 'description'],
        filter: [{ field: 'id', operator: 'ne', value: 1 }],
        join: {
          users: {
            allow: ['id'],
          },
        },
        maxLimit: 5,
      },
    })
    @Controller('companies')
    class CompaniesController {
      constructor(public service: CompaniesService) {}
    }

    @Crud({
      model: { type: Project },
      routes: {
        updateOneBase: {
          returnShallow: true,
        },
      },
      query: {
        join: {
          company: {
            eager: true,
            persist: ['id'],
            exclude: ['updatedAt', 'createdAt'],
          },
          users: {},
          userProjects: {},
        },
        sort: [{ field: 'id', order: 'ASC' }],
        limit: 100,
      },
    })
    @Controller('projects')
    class ProjectsController {
      constructor(public service: ProjectsService) {}
    }

    @Crud({
      model: { type: Project },
    })
    @Controller('projects2')
    class ProjectsController2 {
      constructor(public service: ProjectsService) {}
    }

    @Crud({
      model: { type: Project },
      query: {
        filter: [{ field: 'isActive', operator: 'eq', value: false }],
      },
    })
    @Controller('projects3')
    class ProjectsController3 {
      constructor(public service: ProjectsService) {}
    }

    @Crud({
      model: { type: Project },
      query: {
        filter: { isActive: true },
      },
      operators: {
        custom: {
          $customEqual: { query: (field, param) => `${field} = :${param}` },
          $customArrayIn: {
            isArray: true,
            query: (field, param) => {
              return `${field} IN (:...${param})`;
            },
          },
        },
      },
    })
    @Controller('projects4')
    class ProjectsController4 {
      constructor(public service: ProjectsService) {}
    }

    @Crud({
      model: { type: User },
      query: {
        join: {
          company: {},
          'company.projects': {},
          userLicenses: {},
          invalid: {
            eager: true,
          },
          'foo.bar': {
            eager: true,
          },
        },
      },
    })
    @Controller('users')
    class UsersController {
      constructor(public service: UsersService) {}
    }

    @Crud({
      model: { type: User },
      query: {
        join: {
          company: {},
          'company.projects': {
            alias: 'pr',
          },
        },
      },
    })
    @Controller('users2')
    class UsersController2 {
      constructor(public service: UsersService) {}
    }

    @Crud({
      model: { type: User },
      query: {
        join: {
          company: {
            alias: 'userCompany',
            eager: true,
            select: false,
          },
        },
      },
    })
    @Controller('myusers')
    class UsersController3 {
      constructor(public service: UsersService2) {}
    }

    @Crud({
      model: { type: UserProfile },
      query: {
        join: {
          user: {},
        },
      },
    })
    @Controller('profiles')
    class UserProfilesController {
      constructor(public service: UserProfilesService) {}
    }

    @Crud({
      model: { type: Note },
    })
    @Controller('notes')
    class NotesController {
      constructor(public service: NotesService) {}
    }

    beforeAll(async () => {
      const fixture = await Test.createTestingModule({
        imports: [
          TypeOrmModule.forRoot({ ...withCache, logging: true }),
          TypeOrmModule.forFeature([Company, Project, User, UserProfile, Note]),
        ],
        controllers: [
          CompaniesController,
          ProjectsController,
          ProjectsController2,
          ProjectsController3,
          ProjectsController4,
          UsersController,
          UsersController2,
          UsersController3,
          UserProfilesController,
          NotesController,
        ],
        providers: [
          { provide: APP_FILTER, useClass: HttpExceptionFilter },
          CompaniesService,
          UsersService,
          UsersService2,
          ProjectsService,
          UserProfilesService,
          NotesService,
        ],
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

    describe('#select', () => {
      it('should throw status 400', async () => {
        const query = qb.setFilter({ field: 'invalid', operator: 'isnull' }).query();
        const res = await request(server).get('/companies').query(query);
        expect(res.status).toBe(500);
      });
    });

    describe('#query filter', () => {
      it('should return data with limit', async () => {
        const query = qb.setLimit(4).query();
        const res = await request(server).get('/companies').query(query);
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(4);
        res.body.forEach((e: Company) => {
          expect(e.id).not.toBe(1);
        });
      });

      it('should return with maxLimit', async () => {
        const query = qb.setLimit(7).query();
        const res = await request(server).get('/companies').query(query);
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(5);
      });

      it('should return with filter and or 1', async () => {
        const query = qb
          .setFilter({ field: 'name', operator: 'notin', value: ['Name2', 'Name3'] })
          .setOr({ field: 'domain', operator: 'cont', value: 5 })
          .query();
        const res = await request(server).get('/companies').query(query);
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(5);
      });

      it('should return with filter and or 2', async () => {
        const projectName = faker.company.name();

        for (let i = 0; i < 2; i++) {
          await request(server)
            .post('/projects')
            .send({
              companyId: faker.number.int({ min: 1, max: 50 }),
              name: `${projectName}${i}`,
            })
            .expect(201);
        }

        const query = qb
          .setFilter({
            field: 'name',
            operator: 'ends',
            value: `${projectName.slice(-5)}0`,
          })
          .setOr({
            field: 'name',
            operator: 'starts',
            value: `${projectName}1`,
          })
          .query();

        const res = await request(server).get('/projects').query(query);
        expect(res.status).toBe(200);
        expect(res.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ name: `${projectName}0` }),
            expect.objectContaining({ name: `${projectName}1` }),
          ]),
        );
      });

      it('should return with filter and or 3', async () => {
        const query = qb
          .setOr({ field: 'companyId', operator: 'gt', value: 22 })
          .setFilter({ field: 'companyId', operator: 'gte', value: 6 })
          .setFilter({ field: 'companyId', operator: 'lt', value: 10 })
          .query();
        const res = await request(server).get('/projects').query(query);

        expect(res.status).toBe(200);
        expect(res.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ companyId: 6 }),
            expect.objectContaining({ companyId: 7 }),
            expect.objectContaining({ companyId: 8 }),
            expect.objectContaining({ companyId: 9 }),
          ]),
        );
      });

      it('should return with filter and or 4', async () => {
        const query = qb
          .setOr({ field: 'companyId', operator: 'in', value: [6, 10] })
          .setOr({ field: 'companyId', operator: 'lte', value: 10 })
          .setFilter({ field: 'isActive', operator: 'eq', value: false })
          .setFilter({ field: 'description', operator: 'notnull' })
          .query();
        const res = await request(server).get('/projects').query(query);

        expect(res.status).toBe(200);
        expect(res.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ companyId: 6 }),
            expect.objectContaining({ companyId: 10 }),
          ]),
        );
      });

      it('should return with filter and or 5', async () => {
        const query = qb.setOr({ field: 'companyId', operator: 'isnull' }).query();
        const res = await request(server).get('/projects').query(query);
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(0);
      });

      it('should return with filter and or 6', async () => {
        const query = qb
          .setOr({ field: 'companyId', operator: 'between', value: [1, 5] })
          .query();
        const res = await request(server).get('/projects').query(query);
        expect(res.status).toBe(200);
        expect(res.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ companyId: 1 }),
            expect.objectContaining({ companyId: 2 }),
            expect.objectContaining({ companyId: 3 }),
            expect.objectContaining({ companyId: 4 }),
            expect.objectContaining({ companyId: 5 }),
          ]),
        );
      });

      it('should return with filter 1', async () => {
        const query = qb.setOr({ field: 'companyId', operator: 'eq', value: 1 }).query();
        const res = await request(server).get('/projects').query(query);
        expect(res.status).toBe(200);
        expect(res.body).toEqual(
          expect.arrayContaining([expect.objectContaining({ companyId: 1 })]),
        );
      });
    });

    describe('#query join', () => {
      it('should return joined entity, 1', async () => {
        const query = qb.setJoin({ field: 'company', select: ['name'] }).query();
        const res = await request(server).get('/projects/2').query(query);
        expect(res.status).toBe(200);
        expect(res.body.company).toBeDefined();
      });

      it('should return joined entity, 2', async () => {
        const query = qb.setJoin({ field: 'users', select: ['name'] }).query();
        const res = await request(server).get('/companies/2').query(query);
        expect(res.status).toBe(200);
        expect(res.body.users).toBeDefined();
        expect(res.body.users.length).not.toBe(0);
      });

      it('should return joined entity, 3', async () => {
        const query = qb
          .setJoin({
            field: 'user',
            select: ['email'],
            on: [{ field: 'user.id', operator: '$eq', value: 1 }],
          })
          .query();
        const res = await request(server).get('/profiles').query(query);
        expect(res.status).toBe(200);
        expect(res.body.length).not.toBe(0);
        expect(res.body[0].user).toBeDefined();
      });

      it('should eager join without selection', async () => {
        const query = qb.search({ 'userCompany.id': { $eq: 1 } }).query();
        const res = await request(server).get('/myusers').query(query);
        expect(res.status).toBe(200);
        expect(res.body).toEqual(
          expect.arrayContaining([expect.objectContaining({ companyId: 1 })]),
        );
      });
    });

    describe('#query nested join', () => {
      it('should return status 400, 1', async () => {
        const query = qb
          .setJoin({ field: 'company' })
          .setJoin({ field: 'company.projects' })
          .setFilter({
            field: 'company.projects.foo',
            operator: 'excl',
            value: 'invalid',
          })
          .query();
        const res = await request(server).get('/users/1').query(query);
        expect(res.status).toBe(500);
      });

      it('should return status 400, 2', async () => {
        const query = qb
          .setJoin({ field: 'company' })
          .setJoin({ field: 'company.projects' })
          .setFilter({
            field: 'invalid.projects',
            operator: 'excl',
            value: 'invalid',
          })
          .query();
        const res = await request(server).get('/users/1').query(query);
        expect(res.status).toBe(500);
      });

      it('should return status 400, 3', async () => {
        const query = qb
          .setJoin({ field: 'company' })
          .setJoin({ field: 'company.projects' })
          .setFilter({
            field: 'company.foo',
            operator: 'excl',
            value: 'invalid',
          })
          .query();
        const res = await request(server).get('/users/1').query(query);
        expect(res.status).toBe(500);
      });

      it('should return status 200', async () => {
        const query = qb
          .setJoin({ field: 'company' })
          .setJoin({ field: 'company.projectsinvalid' })
          .query();
        const res = await request(server).get('/users/1').query(query);
        expect(res.status).toBe(200);
      });

      it('should return joined entity, 1', async () => {
        const query = qb
          .setFilter({ field: 'company.name', operator: 'excl', value: 'invalid' })
          .setJoin({ field: 'company' })
          .setJoin({ field: 'company.projects' })
          .query();
        const res = await request(server).get('/users/1').query(query);
        expect(res.status).toBe(200);
        expect(res.body.company).toBeDefined();
        expect(res.body.company.projects).toBeDefined();
      });

      it('should return joined entity, 2', async () => {
        const query = qb
          .setFilter({ field: 'company.projects.id', operator: 'notnull' })
          .setJoin({ field: 'company' })
          .setJoin({ field: 'company.projects' })
          .query();
        const res = await request(server).get('/users/1').query(query);
        expect(res.status).toBe(200);
        expect(res.body.company).toBeDefined();
        expect(res.body.company.projects).toBeDefined();
      });

      it('should return joined entity with alias', async () => {
        const query = qb
          .setFilter({ field: 'pr.id', operator: 'notnull' })
          .setJoin({ field: 'company' })
          .setJoin({ field: 'company.projects' })
          .query();
        const res = await request(server).get('/users2/1').query(query);
        expect(res.status).toBe(200);
        expect(res.body.company).toBeDefined();
        expect(res.body.company.projects).toBeDefined();
      });

      it('should return joined entity with ManyToMany pivot table', async () => {
        const query = qb
          .setJoin({ field: 'users' })
          .setJoin({ field: 'userProjects' })
          .query();
        const res = await request(server).get('/projects/1').query(query);
        expect(res.status).toBe(200);
        expect(res.body.users).toBeDefined();
      });
    });

    describe('#query composite key join', () => {
      it('should return joined relation', async () => {
        const query = qb.setJoin({ field: 'userLicenses' }).query();
        const res = await request(server).get('/users/1').query(query);
        expect(res.status).toBe(200);
        expect(res.body.userLicenses).toBeDefined();
      });
    });

    describe('#sort', () => {
      it('should sort by field', async () => {
        const query = qb.sortBy({ field: 'id', order: 'DESC' }).query();
        const res = await request(server).get('/users').query(query).expect(200);
        expect(res.body[1].id).toBeLessThan(res.body[0].id);
      });

      it('should sort by nested field, 1', async () => {
        const query = qb
          .setFilter({ field: 'company.id', operator: 'notnull' })
          .setJoin({ field: 'company' })
          .sortBy({ field: 'company.id', order: 'DESC' })
          .query();
        const res = await request(server).get('/users').query(query).expect(200);
        expect(res.body[res.body.length - 1].company.id).toBeLessThan(
          res.body[0].company.id,
        );
      });

      it('should throw 400 if SQL injection has been detected', async () => {
        const query = qb
          .sortBy({
            field: ' ASC; SELECT CAST( version() AS INTEGER); --',
            order: 'DESC',
          })
          .query();

        const res = await request(server).get('/companies').query(query);
        expect(res.status).toBe(400);
      });
    });

    describe('#search', () => {
      const projects2 = () => request(server).get('/projects2');
      const projects3 = () => request(server).get('/projects3');
      const projects4 = () => request(server).get('/projects4');

      it('should return with search 1', async () => {
        const projectName = faker.company.name();

        const resp = await request(server)
          .post('/projects2')
          .send({
            companyId: faker.number.int({ min: 1, max: 50 }),
            name: projectName,
          })
          .expect(201);

        const query = qb.search({ id: resp.body.id }).query();
        const res = await projects2().query(query).expect(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].id).toBe(resp.body.id);
      });

      it('should return with search 2', async () => {
        const projectName = faker.company.name();

        const resp = await request(server)
          .post('/projects2')
          .send({
            companyId: faker.number.int({ min: 1, max: 50 }),
            name: projectName,
          })
          .expect(201);

        const query = qb.search({ id: resp.body.id, name: projectName }).query();
        const res = await projects2().query(query).expect(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].id).toBe(resp.body.id);
      });

      it('should return with search 3', async () => {
        const projectName = faker.company.name();

        const resp = await request(server)
          .post('/projects2')
          .send({
            companyId: faker.number.int({ min: 1, max: 50 }),
            name: projectName,
          })
          .expect(201);

        const query = qb.search({ id: resp.body.id, name: { $eq: projectName } }).query();
        const res = await projects2().query(query).expect(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].id).toBe(resp.body.id);
      });

      it('should return with search 4', async () => {
        const projectName = faker.company.name();

        const resp = await request(server)
          .post('/projects2')
          .send({
            companyId: faker.number.int({ min: 1, max: 50 }),
            name: projectName,
          })
          .expect(201);

        const query = qb.search({ name: { $eq: projectName } }).query();
        const res = await projects2().query(query).expect(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].id).toBe(resp.body.id);
      });

      it('should return with search 5', async () => {
        const projectName = faker.company.name();

        const resp = await request(server)
          .post('/projects2')
          .send({
            companyId: faker.number.int({ min: 1, max: 50 }),
            name: projectName,
          })
          .expect(201);

        const query = qb.search({ id: { $notnull: true, $eq: resp.body.id } }).query();
        const res = await projects2().query(query).expect(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].id).toBe(resp.body.id);
      });

      it('should return with search 6', async () => {
        const projectName = faker.company.name();

        const resp = await request(server)
          .post('/projects2')
          .send({
            companyId: faker.number.int({ min: 1, max: 50 }),
            name: projectName,
          })
          .expect(201);

        const query = qb
          .search({ id: { $or: { $isnull: true, $eq: resp.body.id } } })
          .query();
        const res = await projects2().query(query).expect(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].id).toBe(resp.body.id);
      });

      it('should return with search 7', async () => {
        const projectName = faker.company.name();

        const resp = await request(server)
          .post('/projects2')
          .send({
            companyId: faker.number.int({ min: 1, max: 50 }),
            name: projectName,
          })
          .expect(201);

        const query = qb.search({ id: { $or: { $eq: resp.body.id } } }).query();
        const res = await projects2().query(query).expect(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].id).toBe(resp.body.id);
      });

      it('should return with search, 8', async () => {
        const projectName = faker.company.name();

        const resp = await request(server)
          .post('/projects2')
          .send({
            companyId: faker.number.int({ min: 1, max: 50 }),
            name: projectName,
          })
          .expect(201);

        const query = qb
          .search({
            id: { $notnull: true, $or: { $eq: resp.body.id, $in: [99999, 9999999] } },
          })
          .query();
        const res = await projects2().query(query).expect(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].id).toBe(resp.body.id);
      });

      it('should return with search 9', async () => {
        const projectName = faker.company.name();

        const resp = await request(server)
          .post('/projects2')
          .send({
            companyId: faker.number.int({ min: 1, max: 50 }),
            name: projectName,
          })
          .expect(201);

        const query = qb
          .search({ id: { $notnull: true, $or: { $eq: resp.body.id } } })
          .query();
        const res = await projects2().query(query).expect(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].id).toBe(resp.body.id);
      });

      it('should return with search 10', async () => {
        const query = qb.search({ id: null as any }).query();
        const res = await projects2().query(query).expect(200);
        expect(res.body).toHaveLength(0);
      });

      it('should return with search 11', async () => {
        const query = qb
          .search({ $and: [{ id: { $notin: [5, 6, 7] } }, { isActive: true }] })
          .query();
        const res = await projects2().query(query).expect(200);

        expect(res.body).not.toEqual(
          expect.arrayContaining([
            expect.objectContaining({ id: 5 }),
            expect.objectContaining({ id: 6 }),
            expect.objectContaining({ id: 7 }),
          ]),
        );
      });

      it('should return with search 12', async () => {
        const query = qb.search({ $and: [{ id: { $notin: [5, 6, 7] } }] }).query();
        const res = await projects2().query(query).expect(200);
        expect(res.body).not.toEqual(
          expect.arrayContaining([
            expect.objectContaining({ id: 5 }),
            expect.objectContaining({ id: 6 }),
            expect.objectContaining({ id: 7 }),
          ]),
        );
      });

      it('should return with search 13', async () => {
        const query = qb.search({ $or: [{ id: 999999 }] }).query();
        const res = await projects2().query(query).expect(200);
        expect(res.body).toHaveLength(0);
      });

      it('should return with search 14', async () => {
        const query = qb
          .search({ $or: [{ id: 11 }, { id: 10 }, { id: { $in: [1, 2] } }] })
          .query();
        const res = await projects2().query(query).expect(200);
        expect(res.body).toHaveLength(4);
        expect(res.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ id: 1 }),
            expect.objectContaining({ id: 2 }),
            expect.objectContaining({ id: 10 }),
            expect.objectContaining({ id: 11 }),
          ]),
        );
      });

      it('should return with search 15', async () => {
        const projectName = faker.lorem.word({ length: 32 });

        const query = qb.search({ $or: [{ id: 9999 }], name: projectName }).query();
        const res = await projects2().query(query).expect(200);
        expect(res.body).toHaveLength(0);
      });

      it('should return with search 16', async () => {
        const projectName = faker.company.name();

        const resp = await request(server)
          .post('/projects2')
          .send({
            companyId: faker.number.int({ min: 1, max: 50 }),
            name: projectName,
          })
          .expect(201);

        const query = qb
          .search({
            $or: [{ isActive: false }, { id: { $eq: resp.body.id } }],
            name: { $eq: projectName },
          })
          .query();
        const res = await projects2().query(query).expect(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].id).toBe(resp.body.id);
      });

      it('should return with default filter, 1', async () => {
        const projectName = faker.company.name();

        const resp = await request(server)
          .post('/projects3')
          .send({
            companyId: faker.number.int({ min: 1, max: 50 }),
            name: projectName,
            isActive: false,
          })
          .expect(201);

        const query = qb.search({ name: projectName }).query();
        const res = await projects3().query(query).expect(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].id).toBe(resp.body.id);
      });

      it('should return with default filter, 2', async () => {
        const projectName = 'unexisting_project_name';

        const query = qb.search({ name: projectName }).query();
        const res = await projects3().query(query).expect(200);
        expect(res.body).toHaveLength(0);
      });

      it('should return with default filter, 3', async () => {
        const projectName = faker.company.name();

        const resp = await request(server)
          .post('/projects4')
          .send({ companyId: faker.number.int({ min: 1, max: 50 }), name: projectName })
          .expect(201);

        const query = qb.search({ name: projectName }).query();
        const res = await projects4().query(query).expect(200);

        expect(res.body).toHaveLength(1);
        expect(res.body[0].id).toBe(resp.body.id);
      });

      it('should return with default filter, 4', async () => {
        const projectName = 'unexisting_project_name';

        const query = qb.search({ name: projectName }).query();
        const res = await projects4().query(query).expect(200);
        expect(res.body).toHaveLength(0);
      });

      it('should return with eqL search operator', async () => {
        const projectName = faker.company.name().toLowerCase();

        const resp = await request(server)
          .post('/projects4')
          .send({
            companyId: faker.number.int({ min: 1, max: 50 }),
            name: projectName,
          })
          .expect(201);

        const query = qb.search({ name: { $eqL: projectName } }).query();
        const res = await projects4().query(query).expect(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].id).toBe(resp.body.id);
      });

      it('should return with neL search operator', async () => {
        const projectName = faker.company.name();

        await request(server)
          .post('/projects4')
          .send({ companyId: faker.number.int({ min: 1, max: 50 }), name: projectName })
          .expect(201);

        const query = qb.search({ name: { $neL: `${projectName}1` } }).query();
        const res = await projects4().query(query).expect(200);
        expect(res.body.length).toBeGreaterThan(1);
      });

      it('should return with startsL search operator', async () => {
        const uniquePrefix = `2121foo`;

        for (let i = 0; i < 2; i++) {
          await request(server)
            .post('/users')
            .send({
              companyId: faker.number.int({ min: 1, max: 50 }),
              isActive: faker.datatype.boolean(),
              email: `${uniquePrefix}${faker.internet.email()}`,
              name: {
                first: faker.person.firstName(),
                last: faker.person.lastName(),
              },
            })
            .expect(201);
        }

        const query = qb.search({ email: { $startsL: uniquePrefix } }).query();
        const res = await request(server).get('/users').query(query).expect(200);
        expect(res.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              email: expect.stringContaining(uniquePrefix),
            }),
          ]),
        );
      });

      it('should return with endsL search operator', async () => {
        const uniqueSuffix = `AiN10`;
        const uniqueDomain = `${faker.lorem.word().toLowerCase()}.Domain10`;

        await request(server)
          .post('/companies')
          .send({
            name: faker.company.name(),
            domain: uniqueDomain,
            description: faker.lorem.sentence(),
          })
          .expect(201);

        const query = qb.search({ domain: { $endsL: uniqueSuffix } }).query();
        const res = await request(server).get('/companies').query(query).expect(200);
        expect(res.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              domain: expect.stringContaining('.Domain10'),
            }),
          ]),
        );
      });

      it('should return with contL search operator', async () => {
        const uniqueMiddle = `bar2baz121foo`;

        for (let i = 0; i < 2; i++) {
          await request(server)
            .post('/users')
            .send({
              companyId: faker.number.int({ min: 1, max: 50 }),
              isActive: faker.datatype.boolean(),
              email: `foobar${uniqueMiddle}${faker.internet.email()}`,
              name: {
                first: faker.person.firstName(),
                last: faker.person.lastName(),
              },
            })
            .expect(201);
        }

        const query = qb.search({ email: { $contL: uniqueMiddle } }).query();
        const res = await request(server).get('/users').query(query).expect(200);

        expect(res.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              email: expect.stringContaining(uniqueMiddle),
            }),
          ]),
        );
      });

      it('should return with exclL search operator', async () => {
        const uniqueMiddle = `bar3baz777foo`;

        for (let i = 0; i < 2; i++) {
          await request(server)
            .post('/users')
            .send({
              companyId: faker.number.int({ min: 1, max: 50 }),
              isActive: faker.datatype.boolean(),
              email: `foobar${uniqueMiddle}${faker.internet.email()}`,
              name: {
                first: faker.person.firstName(),
                last: faker.person.lastName(),
              },
            })
            .expect(201);
        }

        const query = qb.search({ email: { $exclL: uniqueMiddle } }).query();
        const res = await request(server).get('/users').query(query).expect(200);

        expect(res.body).not.toEqual(
          expect.objectContaining({
            email: expect.stringContaining(uniqueMiddle),
          }),
        );
      });

      it('should return with inL search operator', async () => {
        const companyName = faker.company.name().toLowerCase();

        for (let i = 0; i < 2; i++) {
          await request(server)
            .post('/companies')
            .send({
              name: `${companyName}${i}`,
              domain: faker.internet.domainName(),
              description: faker.lorem.sentence(),
            })
            .expect(201);
        }

        const query = qb
          .search({ name: { $inL: [`${companyName}0`, `${companyName}1`] } })
          .query();
        const res = await request(server).get('/companies').query(query).expect(200);

        expect(res.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ name: `${companyName}0` }),
            expect.objectContaining({ name: `${companyName}1` }),
          ]),
        );
      });

      it('should return with notinL search operator', async () => {
        const companyName = faker.company.name().toLowerCase();

        const query = qb
          .search({ name: { $notinL: [`${companyName}999`, `${companyName}777`] } })
          .query();
        const res = await projects4().query(query).expect(200);
        expect(res.body.length).toBeGreaterThan(1);
      });

      it('should return with custom customEqual search operator', async () => {
        const projectName = faker.company.name().toLowerCase();

        const resp = await request(server)
          .post('/projects4')
          .send({ companyId: faker.number.int({ min: 1, max: 50 }), name: projectName })
          .expect(201);

        const query = qb.search({ name: { $customEqual: projectName } }).query();
        const res = await projects4().query(query).expect(200);
        expect(res.body[0].id).toBe(resp.body.id);
      });

      it('should return with custom customArrayIn search operator', async () => {
        const projectName = faker.company.name().toLowerCase();

        for (let i = 0; i < 3; i++) {
          await request(server)
            .post('/projects4')
            .send({
              companyId: faker.number.int({ min: 1, max: 50 }),
              name: `${projectName}${i}`,
            })
            .expect(201);
        }

        const query = qb
          .search({
            name: {
              $customArrayIn: [`${projectName}0`, `${projectName}1`, `${projectName}2`],
            },
          })
          .query();
        const res = await projects4().query(query).expect(200);

        expect(res.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ name: `${projectName}0` }),
            expect.objectContaining({ name: `${projectName}1` }),
            expect.objectContaining({ name: `${projectName}2` }),
          ]),
        );
      });
    });

    describe('#update', () => {
      it('should update company id of project', async () => {
        await request(server).patch('/projects/18').send({ companyId: 10 }).expect(200);

        const modified = await request(server).get('/projects/18').expect(200);

        expect(modified.body.companyId).toBe(10);
      });
    });
  });
});
