import type { PolicyGuardOpts, Policy } from '../types';
import { BaseRouteName } from '@ihelpee/crud';
export declare const Policies: (...policies: Policy[]) => import("@nestjs/common").CustomDecorator<string>;
export declare const createDefaultPolicies: (opts: Pick<PolicyGuardOpts, "policyName">) => { [K in keyof typeof BaseRouteName]?: Policy[]; };
export declare const ApplyCrudPolicies: (opts: Pick<PolicyGuardOpts, "policyName" | "routes">) => (target: any) => void;
export declare const CrudGuard: (opts: PolicyGuardOpts) => (target: any) => void;
