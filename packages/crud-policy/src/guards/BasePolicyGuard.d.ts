import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { PolicyGuardOpts, Policy } from '../types';
export declare class BasePolicyGuard implements CanActivate {
    reflector: Reflector;
    opts: Pick<PolicyGuardOpts, 'extractors' | 'userPolicyField'>;
    constructor(reflector: Reflector, opts: Pick<PolicyGuardOpts, 'extractors' | 'userPolicyField'>);
    canActivate(context: ExecutionContext): Promise<boolean> | boolean;
    getRequiredPolicies(context: ExecutionContext): Policy[] | undefined;
    getAndValidateResourceId(params: Record<string, unknown>, body: Record<string, unknown>): any;
    hasCorrectPolicies(context: ExecutionContext): boolean;
}
