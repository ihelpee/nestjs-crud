import { BaseEntity } from '../base-entity';
import { UserProfile } from '../users-profiles/user-profile.entity';
import { UserLicense } from '../users-licenses/user-license.entity';
import { Company } from '../companies/company.entity';
import { Project } from '../projects/project.entity';
import { UserProject } from '../projects/user-project.entity';
export declare class Name {
    first: string;
    last: string;
}
export declare class User extends BaseEntity {
    email: string;
    isActive: boolean;
    name: Name;
    profileId?: number;
    companyId?: number;
    deletedAt?: Date;
    profile?: UserProfile;
    company?: Company;
    projects?: Project[];
    userProjects?: UserProject[];
    userLicenses?: UserLicense[];
}
