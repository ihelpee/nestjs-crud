import { User } from '../users/user.entity';
import { License } from './license.entity';
export declare class UserLicense {
    userId: number;
    licenseId: number;
    user: User;
    license: License;
    yearsActive: number;
}
