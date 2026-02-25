import { CrudController, CrudRequest } from '@ihelpee/crud';
import { User } from './user.entity';
import { UsersService } from './users.service';
export declare class UsersController implements CrudController<User> {
    service: UsersService;
    constructor(service: UsersService);
    get base(): CrudController<User>;
    getAll(req: CrudRequest): Promise<User[] | import("@ihelpee/crud").GetManyDefaultResponse<User>>;
}
