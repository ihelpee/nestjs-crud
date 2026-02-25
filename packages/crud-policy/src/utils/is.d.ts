import { PolicyActions } from '../constants';
export declare const isReadAction: (action: PolicyActions) => action is PolicyActions.Read;
export declare const isReadOrWriteAction: (action: PolicyActions) => boolean;
export declare const isManageAction: (action: PolicyActions) => action is PolicyActions.Manage;
