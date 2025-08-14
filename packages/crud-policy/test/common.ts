import { CanActivate, Controller, ExecutionContext, Injectable } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { isPg, postgresConfig, mySqlConfig } from '../../../database';
import { User } from '../../../integration/crud-typeorm/users';
import { HttpExceptionFilter } from '../../../integration/shared/https-exception.filter';
import { Crud } from '@ihelpee/crud';
import { UsersService } from '../../../integration/crud-typeorm/users/users.service';
import { CrudGuard } from '../src';

export const createNestMockServer = async (policies: string[]) => {
  const withCache = isPg ? postgresConfig : mySqlConfig;

  @Injectable()
  class AuthGuardMock implements CanActivate {
    async canActivate(ctx: ExecutionContext): Promise<boolean> {
      const req = ctx.switchToHttp().getRequest();
      req.user = { policies };
      return true;
    }
  }

  @CrudGuard({
    policyName: 'user',
    userPolicyField: 'policies',
  })
  @Crud({
    model: { type: User },
  })
  @Controller('/users')
  class UsersController {
    constructor(public service: UsersService) {}
  }

  const fixture = await Test.createTestingModule({
    imports: [
      TypeOrmModule.forRoot({ ...withCache, logging: true }),
      TypeOrmModule.forFeature([User]),
    ],
    controllers: [UsersController],
    providers: [
      { provide: APP_FILTER, useClass: HttpExceptionFilter },
      UsersService,
      {
        provide: APP_GUARD,
        useClass: AuthGuardMock,
      },
    ],
  }).compile();

  const app = fixture.createNestApplication();

  await app.init();
  const server = app.getHttpServer();

  return { app, server };
};
