import { UnauthorizedException } from '@nestjs/common';
import type { GetResourceIdFromBody, GetResourceIdFromParams } from '../types';

export enum Error {
  ID_MISMATCH = 'Requested id does not match',
}

export const isSameIdInBodyAndParams = (bodyId: unknown, paramsId: unknown) => {
  return !(bodyId && paramsId && bodyId !== paramsId);


};

export const createRequestEntityIdGetter = (
  getIdFromBody: GetResourceIdFromBody,
  getIdFromParams: GetResourceIdFromParams,
) => {
  return (params: Record<string, unknown>, body: Record<string, unknown>) => {
    const idFromBody = getIdFromBody(body);
    const idFromParams = getIdFromParams(params);

    // if the user is trying to access an entity, we need to make sure the user is not trying to access another one
    if (!isSameIdInBodyAndParams(idFromBody, idFromParams)) {
      throw new UnauthorizedException(Error.ID_MISMATCH);
    }

    // we get the id from the body or the parameters to see what the user is trying to access
    // we do not care who the user is, we just want to know what they are trying to access
    // validating who the user is, is done in the policy validation function
    return idFromBody ?? idFromParams;
  };
};
