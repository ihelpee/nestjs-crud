import { PolicyActions } from '../constants';
import { Policy } from '../types';
import { isReadOrWriteAction, isReadAction, isManageAction } from './is';
import { createManagePolicy, createReadPolicy, createWritePolicy } from './make-policy';

export const validatePolicyWildcard = (
  userPolicies: string[],
  entity: string,
  action: PolicyActions,
  entityId?: string | number,
) => {
  const managePolicy = createManagePolicy(entity, entityId);
  const writePolicy = createWritePolicy(entity, entityId);
  const readPolicy = createReadPolicy(entity, entityId);

  if (isManageAction(action) && userPolicies.includes(managePolicy)) {
    return true;
  }

  if (
    isReadOrWriteAction(action) &&
    (userPolicies.includes(managePolicy) || userPolicies.includes(writePolicy))
  ) {
    return true;
  }

  return (
    isReadAction(action) &&
    (userPolicies.includes(managePolicy) ||
      userPolicies.includes(writePolicy) ||
      userPolicies.includes(readPolicy))
  );
};

export const validatePolicies = (
  requiredPolicies: Policy[],
  userPolicies: string[],
  entityId?: string | number,
) => {
  return requiredPolicies.every(({ action, name }) => {
    // wild card check on top of the policy
    if (validatePolicyWildcard(userPolicies, name.split('.')[0], action)) {
      return true;
    }

    // wild card check on top of the sub policy with
    if (validatePolicyWildcard(userPolicies, name, action)) {
      return true;
    }

    // check wild card check on top of the policy with entity id
    if (
      entityId &&
      validatePolicyWildcard(userPolicies, name.split('.')[0], action, entityId)
    ) {
      return true;
    }

    // check on exact userbound policy
    return entityId && validatePolicyWildcard(userPolicies, name, action, entityId);
  });
};
