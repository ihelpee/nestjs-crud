import { TypeOrmCrudService } from '@ihelpee/crud-typeorm';
import { User } from './user.entity';
export declare class UsersService extends TypeOrmCrudService<User> {
    constructor(repo: any);
}
