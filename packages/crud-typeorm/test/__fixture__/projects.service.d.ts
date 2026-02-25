import { TypeOrmCrudService } from '../../../crud-typeorm/src/typeorm-crud.service';
import { Project } from '../../../../integration/crud-typeorm/projects';
export declare class ProjectsService extends TypeOrmCrudService<Project> {
    constructor(repo: any);
}
