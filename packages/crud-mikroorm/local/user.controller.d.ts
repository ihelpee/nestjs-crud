import { UsersService } from './users.service';
import { CrudController } from '@ihelpee/crud';
import { Users } from './user-mikroorm.entity';
export declare class UsersController implements CrudController<Users> {
    service: UsersService;
    constructor(service: UsersService);
}
