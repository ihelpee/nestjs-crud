import { Type } from '@nestjs/common';
import { CreateManyDto, CrudRequest, GetManyDefaultResponse } from '../../../src/interfaces';
import { CrudService } from '../../../src/services';
import { TestSerializeModel } from '../models';
export declare class TestSerializeService<T = TestSerializeModel> extends CrudService<T> {
    private Model;
    private store;
    constructor(Model: Type<T>);
    getMany(req: CrudRequest): Promise<GetManyDefaultResponse<T> | T[]>;
    getOne(req: CrudRequest): Promise<T>;
    createOne(req: CrudRequest, dto: T): Promise<any>;
    createMany(req: CrudRequest, dto: CreateManyDto<T>): Promise<any>;
    updateOne(req: CrudRequest, dto: T): Promise<any>;
    replaceOne(req: CrudRequest, dto: T): Promise<any>;
    deleteOne(req: CrudRequest): Promise<any>;
    recoverOne(req: CrudRequest): Promise<any>;
}
