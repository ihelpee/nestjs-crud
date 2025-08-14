import type { BaseRouteName } from '@ihelpee/crud';
import type { PolicyActions } from '../constants';

export type Policy = {
  name: string;
  action: PolicyActions;
};

export type PolicyGuardOpts = {
  routes?: {
    [K in BaseRouteName]?: Policy[];
  };
  policyName: string;
  userPolicyField: string;
  extractors?: {
    getResourceIdFromBody: GetResourceIdFromBody;
    getResourceIdFromParams: GetResourceIdFromParams;
  };
};

export type GetResourceIdFromParams = (params: Record<string, unknown>) => unknown;

export type GetResourceIdFromBody = (body: Record<string, unknown>) => unknown;
