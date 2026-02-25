import { PolicyActions } from '../constants';
import { Policy } from '../types';
export declare const validatePolicyWildcard: (userPolicies: string[], entity: string, action: PolicyActions, entityId?: string | number) => boolean;
export declare const validatePolicies: (requiredPolicies: Policy[], userPolicies: string[], entityId?: string | number) => boolean;
