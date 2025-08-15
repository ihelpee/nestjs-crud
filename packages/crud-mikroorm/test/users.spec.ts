import { Test, TestingModule } from '@nestjs/testing';
import { EntityCaseNamingStrategy, MikroORM } from '@mikro-orm/core';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { Crud } from '@ihelpee/crud';
import { Controller, INestApplication } from '@nestjs/common';
import { UsersService } from './__fixture__/users.service';
import { User } from './__fixture__/user.entity';

jest.setTimeout(60000);

describe('UsersService', () => {
  let orm: any;
  let app: INestApplication;
  let server: any;
  let service: UsersService;

  @Crud({
    model: { type: User },
    query: {
      alwaysPaginate: true,
      limit: 3,
    },
  })
  @Controller('users0')
  class UsersController0 {
    constructor(public service: UsersService) {}
  }

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MikroOrmModule.forRoot({
          entities: [User], // Your entity
          dbName: 'ihelpee_crud', // Replace with your local database name
          user: 'ihelpee_crud', // Replace with your PostgreSQL username
          password: 'ihelpee_crud', // Replace with your PostgreSQL password
          port: 5432, // Default PostgreSQL port
          host: 'localhost', // Assuming your database is local
          debug: true, // Optional: Enable SQL query logging
          driver: PostgreSqlDriver,
          namingStrategy: EntityCaseNamingStrategy,
          allowGlobalContext: true,
        }),
        MikroOrmModule.forFeature([User]),
      ],
      providers: [UsersService],
      controllers: [UsersController0],
    }).compile();

    orm = module.get<MikroORM>(MikroORM);
    await orm.getSchemaGenerator().createSchema();
    app = module.createNestApplication();
    service = app.get<UsersService>(UsersService);

    await app.init();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await orm.getSchemaGenerator().dropSchema();
    await orm.close(true);
  });

  it('should return user name after createOne', async () => {
    const user = await service.createOne(
      {
        parsed: {
          fields: [],
          paramsFilter: [],
          authPersist: {},
          classTransformOptions: {},
          search: {},
          filter: [],
          or: [],
          join: [],
          sort: [],
          limit: 0,
          offset: 0,
          page: 1,
          cache: 0,
          includeDeleted: 0,
        },
        options: undefined,
      },
      {
        nameFirst: 'alex',
        nameLast: 'gotardi',
      },
    );

    expect(user).toEqual({
      id: expect.any(Number),
      nameFirst: 'alex',
      nameLast: 'gotardi',
    });
  });

  it('should return the id of the first user after findAll', async () => {
    const users = await service.findAll();

    expect(users[0].id).toEqual(1);
  });
});
