import { PolicyActions } from '../constants';
export declare const makePolicy: (action: PolicyActions) => (entity: string, entityId?: string | number) => string;
export declare const createReadPolicy: (entity: string, entityId?: string | number) => string;
export declare const createWritePolicy: (entity: string, entityId?: string | number) => string;
export declare const createManagePolicy: (entity: string, entityId?: string | number) => string;
