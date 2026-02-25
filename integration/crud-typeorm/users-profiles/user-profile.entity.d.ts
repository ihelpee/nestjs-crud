import { BaseEntity } from '../base-entity';
import { User } from '../users/user.entity';
export declare class UserProfile extends BaseEntity {
    name: string;
    deletedAt?: Date;
    user?: User;
}
