import { ExecutionContext } from '@nestjs/common';
import { MergedCrudOptions } from '../interfaces';
import { CrudActions } from '../constants';
export declare class CrudBaseInterceptor {
    protected getCrudInfo(context: ExecutionContext): {
        ctrlOptions: MergedCrudOptions;
        crudOptions: Partial<MergedCrudOptions>;
        action: CrudActions;
    };
}
