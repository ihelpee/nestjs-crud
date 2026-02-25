import { ValidationPipe } from '@nestjs/common';
import { CrudOptions, MergedCrudOptions } from '../interfaces';
import { CrudValidationGroups } from '../constants';
export declare class Validation {
    static getValidationPipe(options: CrudOptions, group?: CrudValidationGroups): ValidationPipe;
    static createBulkDto<T = any>(options: MergedCrudOptions): any;
}
