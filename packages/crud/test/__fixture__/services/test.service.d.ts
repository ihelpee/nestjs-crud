import { CreateManyDto, CrudRequest } from '@ihelpee/crud';
import { CrudService } from '@ihelpee/crud';
export declare class TestService<T> extends CrudService<T> {
    getMany(req: CrudRequest): Promise<any>;
    getOne(req: CrudRequest): Promise<any>;
    createOne(req: CrudRequest, dto: T): Promise<any>;
    createMany(req: CrudRequest, dto: CreateManyDto<T>): Promise<any>;
    updateOne(req: CrudRequest, dto: T): Promise<any>;
    replaceOne(req: CrudRequest, dto: T): Promise<any>;
    deleteOne(req: CrudRequest): Promise<any>;
    recoverOne(req: CrudRequest): Promise<any>;
    decidePagination(): boolean;
}
