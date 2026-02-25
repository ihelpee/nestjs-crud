import { Type } from '@nestjs/common';
import type { DtoOptions } from '../interfaces';
export declare const createUniqueClassWithDefaults: <T>(cls: Type<T>, action: string, defaults: Partial<T>) => Type<T & typeof defaults>;
export type DtoDecorator<T> = {
    keysToOmitOnCreate: readonly (keyof T)[];
    keysToOmitOnUpdate: readonly (keyof T)[];
    defaults: Partial<T>;
};
export declare const createCrudDtoDecorators: <T>(classRef: Type<T>, opts: Partial<DtoDecorator<T>>) => DtoOptions;
