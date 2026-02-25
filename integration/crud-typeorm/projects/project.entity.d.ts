import { BaseEntity } from '../base-entity';
import { Company } from '../companies/company.entity';
import { User } from '../users/user.entity';
import { UserProject } from './user-project.entity';
export declare class Project extends BaseEntity {
    name?: string;
    description?: string;
    isActive?: boolean;
    companyId?: number;
    company?: Company;
    users?: User[];
    userProjects: UserProject[];
}
