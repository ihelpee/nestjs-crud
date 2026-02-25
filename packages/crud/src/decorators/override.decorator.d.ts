import { BaseRouteName } from '../constants';
export declare const Override: (name?: BaseRouteName | keyof typeof BaseRouteName) => (target: any, key: any, descriptor: PropertyDescriptor) => PropertyDescriptor;
