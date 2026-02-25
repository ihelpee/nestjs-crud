import { EntityManager } from '@mikro-orm/core';
import { Users } from './user-mikroorm.entity';
import { MikroOrmCrudService } from '../src/mikroorm-crud.service';
export declare class UsersService extends MikroOrmCrudService<Users> {
    private readonly entityManager;
    constructor(entityManager: EntityManager);
}
