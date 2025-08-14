import { RequestMethod } from '@nestjs/common';

export const FEATURE_NAME_METADATA = 'ihelpee_FEATURE_NAME_METADATA';
export const ACTION_NAME_METADATA = 'ihelpee_ACTION_NAME_METADATA';
export const OVERRIDE_METHOD_METADATA = 'ihelpee_OVERRIDE_METHOD_METADATA';
export const PARSED_BODY_METADATA = 'ihelpee_PARSED_BODY_METADATA';
export const PARSED_CRUD_REQUEST_KEY = 'ihelpee_PARSED_CRUD_REQUEST_KEY';
export const CRUD_OPTIONS_METADATA = 'ihelpee_CRUD_OPTIONS_METADATA';
export const CRUD_AUTH_OPTIONS_METADATA = 'ihelpee_CRUD_AUTH_OPTIONS_METADATA';

export enum CrudActions {
  ReadAll = 'Read-All',
  ReadOne = 'Read-One',
  CreateOne = 'Create-One',
  CreateMany = 'Create-Many',
  UpdateOne = 'Update-One',
  ReplaceOne = 'Replace-One',
  DeleteOne = 'Delete-One',
  RecoverOne = 'Recover-One',
}

export enum CrudValidationGroups {
  CREATE = 'CRUD-CREATE',
  UPDATE = 'CRUD-UPDATE',
}

export enum BaseRouteName {
  getManyBase = 'getManyBase',
  getOneBase = 'getOneBase',
  createOneBase = 'createOneBase',
  createManyBase = 'createManyBase',
  updateOneBase = 'updateOneBase',
  replaceOneBase = 'replaceOneBase',
  deleteOneBase = 'deleteOneBase',
  recoverOneBase = 'recoverOneBase',
}

export const crudAuthActionsMap = new Map<BaseRouteName, CrudActions>([
  [BaseRouteName.getManyBase, CrudActions.ReadAll],
  [BaseRouteName.getOneBase, CrudActions.ReadOne],
  [BaseRouteName.createManyBase, CrudActions.CreateMany],
  [BaseRouteName.createOneBase, CrudActions.CreateOne],
  [BaseRouteName.updateOneBase, CrudActions.UpdateOne],
  [BaseRouteName.deleteOneBase, CrudActions.DeleteOne],
  [BaseRouteName.replaceOneBase, CrudActions.ReplaceOne],
  [BaseRouteName.recoverOneBase, CrudActions.RecoverOne],
]);

export const getRouteSchema = () => [
  {
    name: BaseRouteName.getOneBase,
    path: '/',
    method: RequestMethod.GET,
    enable: false,
    override: false,
    withParams: true,
  },
  {
    name: BaseRouteName.getManyBase,
    path: '/',
    method: RequestMethod.GET,
    enable: false,
    override: false,
    withParams: false,
  },
  {
    name: BaseRouteName.createOneBase,
    path: '/',
    method: RequestMethod.POST,
    enable: false,
    override: false,
    withParams: false,
  },
  {
    name: BaseRouteName.createManyBase,
    path: '/bulk',
    method: RequestMethod.POST,
    enable: false,
    override: false,
    withParams: false,
  },
  {
    name: BaseRouteName.updateOneBase,
    path: '/',
    method: RequestMethod.PATCH,
    enable: false,
    override: false,
    withParams: true,
  },
  {
    name: BaseRouteName.replaceOneBase,
    path: '/',
    method: RequestMethod.PUT,
    enable: false,
    override: false,
    withParams: true,
  },
  {
    name: BaseRouteName.deleteOneBase,
    path: '/',
    method: RequestMethod.DELETE,
    enable: false,
    override: false,
    withParams: true,
  },
  {
    name: BaseRouteName.recoverOneBase,
    path: '/recover',
    method: RequestMethod.PATCH,
    enable: false,
    override: false,
    withParams: true,
  },
];
