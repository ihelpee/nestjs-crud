import { User } from '../users/user.entity';
import { Project } from './project.entity';
export declare class UserProject {
    projectId: number;
    userId: number;
    review: string;
    project: Project;
    user: User;
}
