import {
  Controller,
  INestApplication,
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Crud, CrudAuth } from '@ihelpee/crud';
import * as request from 'supertest';
import { isPg, postgresConfig, mySqlConfig } from '../../../database';
import { User } from '../../../integration/crud-typeorm/users';
import { UserProfile } from '../../../integration/crud-typeorm/users-profiles';
import { Project } from '../../../integration/crud-typeorm/projects';
import { HttpExceptionFilter } from '../../../integration/shared/https-exception.filter';
import { UsersService } from './__fixture__/users.service';
import { ProjectsService } from './__fixture__/projects.service';
import { faker } from '@faker-js/faker';

jest.setTimeout(60000);

describe('#crud-typeorm', () => {
  const withCache = isPg ? postgresConfig : mySqlConfig;

  describe('#CrudAuth', () => {
    const USER_REQUEST_KEY = 'user';
    let app: INestApplication;
    let server: ReturnType<typeof request>;

    @Injectable()
    class AuthGuard implements CanActivate {
      constructor(private usersService: UsersService) {}

      async canActivate(ctx: ExecutionContext): Promise<boolean> {
        const req = ctx.switchToHttp().getRequest();
        req[USER_REQUEST_KEY] = await this.usersService.findOneBy({
          id: 1,
        });

        return true;
      }
    }

    @Crud({
      model: {
        type: User,
      },
      routes: {
        only: ['getOneBase', 'updateOneBase'],
      },
      params: {
        id: {
          primary: true,
          disabled: true,
        },
      },
    })
    @CrudAuth({
      property: USER_REQUEST_KEY,
      filter: (user: User) => ({
        id: user.id,
      }),
      persist: (user: User) => ({
        email: user.email,
      }),
    })
    @Controller('me')
    class MeController {
      constructor(public service: UsersService) {}
    }

    @Crud({
      model: {
        type: Project,
      },
      routes: {
        only: ['createOneBase', 'deleteOneBase'],
      },
    })
    @CrudAuth({
      property: USER_REQUEST_KEY,
      filter: (user: User) => ({
        companyId: user.companyId,
      }),
      persist: (user: User) => ({
        companyId: user.companyId,
      }),
    })
    @Controller('projects')
    class ProjectsController {
      constructor(public service: ProjectsService) {}
    }

    beforeAll(async () => {
      const fixture = await Test.createTestingModule({
        imports: [
          TypeOrmModule.forRoot({ ...withCache, logging: false }),
          TypeOrmModule.forFeature([User, UserProfile, Project]),
        ],
        controllers: [MeController, ProjectsController],
        providers: [
          {
            provide: APP_GUARD,
            useClass: AuthGuard,
          },
          {
            provide: APP_FILTER,
            useClass: HttpExceptionFilter,
          },
          UsersService,
          ProjectsService,
        ],
      }).compile();

      app = fixture.createNestApplication();

      await app.init();
      server = request(app.getHttpServer());
    });

    afterAll(async () => {
      await app.close();
    });

    describe('#getOneBase', () => {
      it('should return a user with id 1', async () => {
        const res = await server.get('/me').expect(200);
        expect(res.body.id).toBe(1);
      });
    });

    describe('#updateOneBase', () => {
      it('should update user with auth persist 1', async () => {
        const res = await server
          .patch('/me')
          .send({
            email: 'some@dot.com',
            isActive: false,
            companyId: faker.number.int({ min: 1, max: 50 }),
          })
          .expect(200);
        expect(res.body.id).toBe(1);
        expect(res.body.email).not.toBe('some@dot.com');
      });
      it('should update user with auth persist 2', async () => {
        const res = await server
          .patch('/me')
          .send({
            email: 'some@dot.com',
            isActive: true,
            companyId: faker.number.int({ min: 1, max: 50 }),
          })
          .expect(200);
        expect(res.body.id).toBe(1);
        expect(res.body.email).not.toBe('some@dot.com');
      });
    });

    describe('#createOneBase', () => {
      it('should create an entity with auth persist', async () => {
        await server
          .post('/projects')
          .send({
            name: faker.company.name(),
            description: 'foo',
            isActive: false,
            companyId: 10,
          })
          .expect(201);
      });
    });

    describe('#deleteOneBase', () => {
      it('should delete an entity with auth filter', async () => {
        const project = await server
          .post('/projects')
          .send({
            name: faker.company.name(),
            description: 'foo',
            isActive: true,
            companyId: faker.number.int({ min: 1, max: 50 }),
          })
          .expect(201);

        await server.delete(`/projects/${project.body.id}`).expect(200);
      });
      it('should throw an error with auth filter', async () => {
        await server.delete('/projects/9999999').expect(404);
      });
    });
  });
});
