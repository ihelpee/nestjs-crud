import { EntityManager } from '@mikro-orm/core';
import { MikroOrmCrudService } from '../../src';
import { User } from './user.entity';
export declare class UsersService extends MikroOrmCrudService<User> {
    private readonly entityManager;
    constructor(entityManager: EntityManager);
}
