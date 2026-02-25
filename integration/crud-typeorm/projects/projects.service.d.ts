import { TypeOrmCrudService } from '@ihelpee/crud-typeorm';
import { Project } from './project.entity';
export declare class ProjectsService extends TypeOrmCrudService<Project> {
    constructor(repo: any);
}
