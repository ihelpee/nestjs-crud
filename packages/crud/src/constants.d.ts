import { RequestMethod } from '@nestjs/common';
export declare const FEATURE_NAME_METADATA = "IHELPEE_FEATURE_NAME_METADATA";
export declare const ACTION_NAME_METADATA = "IHELPEE_ACTION_NAME_METADATA";
export declare const OVERRIDE_METHOD_METADATA = "IHELPEE_OVERRIDE_METHOD_METADATA";
export declare const PARSED_BODY_METADATA = "IHELPEE_PARSED_BODY_METADATA";
export declare const PARSED_CRUD_REQUEST_KEY = "IHELPEE_PARSED_CRUD_REQUEST_KEY";
export declare const CRUD_OPTIONS_METADATA = "IHELPEE_CRUD_OPTIONS_METADATA";
export declare const CRUD_AUTH_OPTIONS_METADATA = "IHELPEE_CRUD_AUTH_OPTIONS_METADATA";
export declare enum CrudActions {
    ReadAll = "Read-All",
    ReadOne = "Read-One",
    CreateOne = "Create-One",
    CreateMany = "Create-Many",
    UpdateOne = "Update-One",
    ReplaceOne = "Replace-One",
    DeleteOne = "Delete-One",
    RecoverOne = "Recover-One"
}
export declare enum CrudValidationGroups {
    CREATE = "CRUD-CREATE",
    UPDATE = "CRUD-UPDATE"
}
export declare enum BaseRouteName {
    getManyBase = "getManyBase",
    getOneBase = "getOneBase",
    createOneBase = "createOneBase",
    createManyBase = "createManyBase",
    updateOneBase = "updateOneBase",
    replaceOneBase = "replaceOneBase",
    deleteOneBase = "deleteOneBase",
    recoverOneBase = "recoverOneBase"
}
export declare const crudAuthActionsMap: Map<BaseRouteName, CrudActions>;
export declare const getRouteSchema: () => {
    name: BaseRouteName;
    path: string;
    method: RequestMethod;
    enable: boolean;
    override: boolean;
    withParams: boolean;
}[];
