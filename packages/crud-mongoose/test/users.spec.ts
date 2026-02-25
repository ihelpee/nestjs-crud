import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Crud } from '@ihelpee/crud';
import { Controller, INestApplication } from '@nestjs/common';
import { UsersService } from './__fixture__/users.service';
import { User, UserSchema, UserDocument } from './__fixture__/user.schema';
import { Model } from 'mongoose';

jest.setTimeout(60000);

describe('UsersService', () => {
  let app: INestApplication;
  let server: any;
  let service: UsersService;
  let userModel: Model<UserDocument>;

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
    // Use the real MongoDB container running in Github Actions / Docker Compose
    const uri = 'mongodb://localhost:27017/ihelpee_crud';

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
      ],
      providers: [UsersService],
      controllers: [UsersController0],
    }).compile();

    app = module.createNestApplication();
    service = app.get<UsersService>(UsersService);
    userModel = module.get<Model<UserDocument>>(getModelToken(User.name));

    await app.init();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    await userModel.deleteMany({});
  });

  it('should return user name after createOne', async () => {
    const user = await service.createOne(
      {
        parsed: {
          fields: [],
          paramsFilter: [],
          authPersist: {},
          classTransformOptions: {},
          search: undefined as any,
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
        options: undefined as any,
      },
      {
        nameFirst: 'alex',
        nameLast: 'gotardi',
      } as any,
    );

    expect(user).toMatchObject({
      nameFirst: 'alex',
      nameLast: 'gotardi',
    });
    expect(user._id).toBeDefined();
  });

  it('should return multiple users after createMany', async () => {
    const users = await service.createMany(
      {
        parsed: {
          fields: [],
          paramsFilter: [],
          authPersist: {},
          classTransformOptions: {},
          search: undefined as any,
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
        options: undefined as any,
      },
      {
        bulk: [
          { nameFirst: 'user1', nameLast: 'last1' },
          { nameFirst: 'user2', nameLast: 'last2' },
        ],
      } as any,
    );

    expect(users).toHaveLength(2);
    expect(users[0]).toMatchObject({ nameFirst: 'user1' });
  });

  describe('getMany complex queries', () => {
    beforeEach(async () => {
      await userModel.create([
        { nameFirst: 'Alex', nameLast: 'Gotardi' },
        { nameFirst: 'Ada', nameLast: 'Lovelace' },
        { nameFirst: 'Alan', nameLast: 'Turing' },
        { nameFirst: 'Margaret', nameLast: 'Hamilton' },
        { nameFirst: 'Grace', nameLast: 'Hopper' },
      ]);
    });

    it('should return paginated users with limit', async () => {
      const result = await service.getMany({
        parsed: {
          fields: [],
          paramsFilter: [],
          authPersist: {},
          classTransformOptions: {},
          search: undefined as any,
          filter: [],
          or: [],
          join: [],
          sort: [],
          limit: 2,
          offset: 0,
          page: 1,
          cache: 0,
          includeDeleted: 0,
        },
        options: { query: { alwaysPaginate: true, maxLimit: 10 } } as any,
      });

      const pageInfo = result as any;
      expect(pageInfo.data).toHaveLength(2);
      expect(pageInfo.total).toBe(5);
      expect(pageInfo.pageCount).toBe(3); // 5 total / 2 limit
    });

    it('should filter by $eq (default filter)', async () => {
      const result = await service.getMany({
        parsed: {
          fields: [],
          paramsFilter: [],
          authPersist: {},
          classTransformOptions: {},
          search: undefined as any,
          filter: [{ field: 'nameFirst', operator: 'eq', value: 'Alex' }],
          or: [],
          join: [],
          sort: [],
          limit: 10,
          offset: 0,
          page: 1,
          cache: 0,
          includeDeleted: 0,
        },
        options: { query: { alwaysPaginate: true } } as any,
      });

      const pageInfo = result as any;
      expect(pageInfo.data).toHaveLength(1);
      expect(pageInfo.data[0].nameLast).toBe('Gotardi');
    });

    it('should filter with $or condition', async () => {
      const result = await service.getMany({
        parsed: {
          fields: [],
          paramsFilter: [],
          authPersist: {},
          classTransformOptions: {},
          search: undefined as any,
          filter: [],
          or: [
            { field: 'nameFirst', operator: 'eq', value: 'Margaret' },
            { field: 'nameFirst', operator: 'eq', value: 'Grace' },
          ],
          join: [],
          sort: [],
          limit: 10,
          offset: 0,
          page: 1,
          cache: 0,
          includeDeleted: 0,
        },
        options: { query: { alwaysPaginate: true } } as any,
      });

      const pageInfo = result as any;
      expect(pageInfo.data).toHaveLength(2);
    });

    it('should sort results via ASC and DESC', async () => {
      const result = await service.getMany({
        parsed: {
          fields: [],
          paramsFilter: [],
          authPersist: {},
          classTransformOptions: {},
          search: undefined as any,
          filter: [],
          or: [],
          join: [],
          sort: [{ field: 'nameFirst', order: 'DESC' }],
          limit: 10,
          offset: 0,
          page: 1,
          cache: 0,
          includeDeleted: 0,
        },
        options: { query: { alwaysPaginate: true } } as any,
      });

      const pageInfo = result as any;
      expect(pageInfo.data).toHaveLength(5);
      expect(pageInfo.data[0].nameFirst).toBe('Margaret'); // 'M' is late in alphabet -> DESC
      expect(pageInfo.data[4].nameFirst).toBe('Ada');
    });

    it('should apply $regex for starts condition', async () => {
      const result = await service.getMany({
        parsed: {
          fields: [],
          paramsFilter: [],
          authPersist: {},
          classTransformOptions: {},
          search: undefined as any,
          filter: [{ field: 'nameFirst', operator: 'starts', value: 'Al' }], // 'Al'ex, 'Al'an
          or: [],
          join: [],
          sort: [],
          limit: 10,
          offset: 0,
          page: 1,
          cache: 0,
          includeDeleted: 0,
        },
        options: { query: { alwaysPaginate: true } } as any,
      });

      const pageInfo = result as any;
      expect(pageInfo.data).toHaveLength(2);
      expect(pageInfo.data.map((d: any) => d.nameFirst)).toContain('Alex');
      expect(pageInfo.data.map((d: any) => d.nameFirst)).toContain('Alan');
    });

    it('should perform cursor-based pagination (seek via _id)', async () => {
      // First page
      const page1Result = await service.getMany({
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
        options: { query: { alwaysPaginate: true } } as any,
      });

      const dataPage1 = (page1Result as any).data;
      expect(dataPage1).toHaveLength(2);

      const lastItemFromPage1 = dataPage1[1];

      // Second page (using cursor / filter $gt lastItem._id)
      const page2Result = await service.getMany({
        parsed: {
          fields: [],
          paramsFilter: [],
          authPersist: {},
          classTransformOptions: {},
          search: undefined as any,
          filter: [{ field: 'id', operator: 'gt', value: lastItemFromPage1._id }],
          or: [],
          join: [],
          sort: [{ field: 'id', order: 'ASC' }],
          limit: 2,
          offset: 0,
          page: 1,
          cache: 0,
          includeDeleted: 0,
        },
        options: { query: { alwaysPaginate: true } } as any,
      });

      const dataPage2 = (page2Result as any).data;
      expect(dataPage2).toHaveLength(2);
      // Ensure no overlap
      expect(dataPage2[0]._id.toString()).not.toBe(lastItemFromPage1._id.toString());
      expect(dataPage2[0].nameFirst).toBeDefined();
    });
  });
});
