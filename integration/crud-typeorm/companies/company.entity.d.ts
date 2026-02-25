import { BaseEntity } from '../base-entity';
import { User } from '../users/user.entity';
import { Project } from '../projects/project.entity';
export declare class Company extends BaseEntity {
    id?: number;
    name: string;
    domain: string;
    description: string;
    deletedAt?: Date;
    users: User[];
    projects: Project[];
}
