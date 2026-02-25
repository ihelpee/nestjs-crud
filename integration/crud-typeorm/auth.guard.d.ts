import { CanActivate, ExecutionContext } from '@nestjs/common';
import { UsersService } from './users';
export declare class AuthGuard implements CanActivate {
    private usersService;
    constructor(usersService: UsersService);
    canActivate(ctx: ExecutionContext): Promise<boolean>;
}
