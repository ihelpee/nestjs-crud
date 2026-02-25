import { TypeOrmCrudService } from '@ihelpee/crud-typeorm';
import { UserProject } from './user-project.entity';
export declare class UserProjectsService extends TypeOrmCrudService<UserProject> {
    constructor(repo: any);
}
