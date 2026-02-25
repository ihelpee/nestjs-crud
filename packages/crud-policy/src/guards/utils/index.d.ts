import { Reflector } from '@nestjs/core';
import type { PolicyGuardOpts } from '../../types';
export declare const createGetAndValidateResourceId: (opts: Pick<PolicyGuardOpts, "extractors">) => ((params: Record<string, unknown>, body: Record<string, unknown>) => unknown) | (() => any);
export declare const createPolicyGuard: (opts: Pick<PolicyGuardOpts, "extractors" | "userPolicyField">) => {
    new (reflector: Reflector): {
        reflector: Reflector;
        opts: Pick<PolicyGuardOpts, "extractors" | "userPolicyField">;
        canActivate(context: import("@nestjs/common").ExecutionContext): Promise<boolean> | boolean;
        getRequiredPolicies(context: import("@nestjs/common").ExecutionContext): import("../../types").Policy[] | undefined;
        getAndValidateResourceId(params: Record<string, unknown>, body: Record<string, unknown>): any;
        hasCorrectPolicies(context: import("@nestjs/common").ExecutionContext): boolean;
    };
};
