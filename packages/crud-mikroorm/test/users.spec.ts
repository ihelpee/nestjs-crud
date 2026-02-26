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

  describe('cursor pagination', () => {
    beforeAll(async () => {
      await orm.em.nativeDelete(User, {});
      // Seed some distinct data
      await service.createMany(
        { parsed: { paramsFilter: [], search: {}, authPersist: {} } } as any,
        {
          bulk: [
            { nameFirst: 'User1', nameLast: 'Last1' },
            { nameFirst: 'User2', nameLast: 'Last2' },
            { nameFirst: 'User3', nameLast: 'Last3' },
            { nameFirst: 'User4', nameLast: 'Last4' },
            { nameFirst: 'User5', nameLast: 'Last5' },
          ],
        } as any,
      );
    });

    it('should perform cursor-based pagination (3 scenarios)', async () => {
      // Scenario 1: First request without cursor
      const req1 = (await service.getMany({
        parsed: {
          fields: [],
          paramsFilter: [],
          authPersist: {},
          classTransformOptions: {},
          search: undefined as any,
          filter: [],
          or: [],
          join: [],
          sort: [{ field: 'id', order: 'ASC' }],
          limit: 2,
          offset: 0,
          page: 1,
          cache: 0,
          includeDeleted: 0,
        },
        options: { query: { useCursor: true, limit: 2 } } as any,
      })) as any;

      expect(req1.data).toHaveLength(2);
      expect(req1.nextCursor).toBeDefined();
      expect(req1.nextCursor).not.toBeNull();

      // Scenario 2: Call passing cursor and other filters
      const req2 = (await service.getMany({
        parsed: {
          fields: [],
          paramsFilter: [],
          authPersist: {},
          classTransformOptions: {},
          search: undefined as any,
          filter: [],
          or: [],
          join: [],
          sort: [{ field: 'id', order: 'ASC' }],
          limit: 2,
          offset: 0,
          page: 1,
          cache: 0,
          includeDeleted: 0,
          cursor: req1.nextCursor,
        },
        options: { query: { useCursor: true, limit: 2 } } as any,
      })) as any;

      expect(req2.data).toHaveLength(2);
      expect(req2.nextCursor).toBeDefined();
      expect(req2.nextCursor).not.toBeNull();
      expect(req2.data[0].id).not.toBe(req1.data[1].id);

      // Scenario 3: Call at the end of records, ensuring nextCursor is null
      const req3 = (await service.getMany({
        parsed: {
          fields: [],
          paramsFilter: [],
          authPersist: {},
          classTransformOptions: {},
          search: undefined as any,
          filter: [],
          or: [],
          join: [],
          sort: [{ field: 'id', order: 'ASC' }],
          limit: 2,
          offset: 0,
          page: 1,
          cache: 0,
          includeDeleted: 0,
          cursor: req2.nextCursor,
        },
        options: { query: { useCursor: true, limit: 2 } } as any,
      })) as any;

      expect(req3.data).toHaveLength(1);
      expect(req3.nextCursor).toBeNull();
    });
  });
});
