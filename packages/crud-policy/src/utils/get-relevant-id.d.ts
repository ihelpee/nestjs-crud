import type { GetResourceIdFromBody, GetResourceIdFromParams } from '../types';
export declare enum Error {
    ID_MISMATCH = "Requested id does not match"
}
export declare const isSameIdInBodyAndParams: (bodyId: unknown, paramsId: unknown) => boolean;
export declare const createRequestEntityIdGetter: (getIdFromBody: GetResourceIdFromBody, getIdFromParams: GetResourceIdFromParams) => (params: Record<string, unknown>, body: Record<string, unknown>) => unknown;
