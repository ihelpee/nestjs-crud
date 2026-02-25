import { TypeOrmCrudService } from '../../src/typeorm-crud.service';
import { UserProfile } from '../../../../integration/crud-typeorm/users-profiles';
export declare class UserProfilesService extends TypeOrmCrudService<UserProfile> {
    constructor(repo: any);
}
