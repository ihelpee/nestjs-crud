import { CreateManyDto, CrudRequest, CrudService, GetManyDefaultResponse, QueryOptions } from '@ihelpee/crud';
import { DeepPartial, EntityClass, EntityData, EntityManager, EntityMetadata, EntityRepository } from '@mikro-orm/core';
import { ObjectLiteral } from '@ihelpee/crud-util';
export declare class MikroOrmCrudService<T extends object, DTO extends EntityData<T> = EntityData<T>> extends CrudService<T, EntityData<T>> {
    private readonly repository;
    protected entityColumns: string[];
    protected entityPrimaryColumns: string[];
    protected entityName: string;
    protected entityColumnsHash: ObjectLiteral;
    protected entityHasDeletedColumn: boolean;
    protected deletedAtColumnName: string;
    protected dbName: string;
    protected entity: EntityClass<any>;
    protected em: EntityManager;
    protected sqlInjectionRegEx: RegExp[];
    constructor(repository: EntityRepository<T>);
    get findOne(): any;
    get findOneOrFail(): any;
    get find(): any;
    get count(): any;
    protected get alias(): string;
    protected onInitMapEntityColumns(): void;
    validateFields(fields: string[]): void;
    validateFilterFields(filter: any): void;
    getMany(req: CrudRequest): Promise<GetManyDefaultResponse<T> | T[]>;
    getOne(req: CrudRequest): Promise<T>;
    createOne(req: CrudRequest, dto: DeepPartial<T>): Promise<T>;
    createMany(req: CrudRequest, dtoList: CreateManyDto<DeepPartial<T>>): Promise<T[]>;
    updateOne(req: CrudRequest, dto: DTO): Promise<T>;
    protected transformSort(sortFields: any[]): any;
    protected applyCondition(field: string, operator: string, value: string): {
        [x: string]: string;
    } | {
        [x: string]: {
            $ne: string;
        };
    } | {
        [x: string]: {
            $lt: string;
        };
    } | {
        [x: string]: {
            $lte: string;
        };
    } | {
        [x: string]: {
            $gt: string;
        };
    } | {
        [x: string]: {
            $gte: string;
        };
    } | {
        [x: string]: {
            $like: string;
        };
    } | {
        [x: string]: {
            $notLike: string;
        };
    } | {
        [x: string]: {
            $in: string;
        };
    } | {
        [x: string]: {
            $nin: string;
        };
    } | {
        [x: string]: {
            $eq: any;
        };
    } | {
        [x: string]: {
            $gte: any;
            $lte: any;
        };
    } | {
        [x: string]: {
            $contains: string;
        };
    } | {
        [x: string]: {
            $overlap: string;
        };
    };
    protected transformParsedToMikro(parsed: any): any;
    protected transformOptionsToMikro(options: any): any;
    protected getOneOrFail(req: CrudRequest, withDeleted?: boolean): Promise<T>;
    replaceOne(req: CrudRequest, dto: DTO): Promise<T>;
    deleteOne(req: CrudRequest): Promise<void | T>;
    softDelete(entity: T): Promise<void>;
    recoverOne(req: CrudRequest): Promise<void | T>;
    findAll(): Promise<T[]>;
    getParamFilters(parsed: CrudRequest['parsed']): ObjectLiteral;
    protected getEntityColumns(entityMetadata: EntityMetadata): {
        columns: string[];
        primaryColumns: string[];
    };
    protected getAllowedColumns(columns: string[], options: QueryOptions): string[];
    protected prepareEntityBeforeSave(dto: DeepPartial<T>, parsed: CrudRequest['parsed']): T | undefined;
    protected checkSqlInjection(field: string): void;
    protected validateSqlInjectionFields(crudRequest: CrudRequest): void;
}
