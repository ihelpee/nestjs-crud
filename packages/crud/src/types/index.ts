import {
  QueryFilter,
  SCondition,
} from '@ihelpee/crud-request/lib/types/request-query.types';
import { getRouteSchema } from '../constants';

export type BaseRoute = ReturnType<typeof getRouteSchema>[number];

export type QueryFilterFunction = (
  search?: SCondition,
  getMany?: boolean,
) => SCondition | void;
export type QueryFilterOption = QueryFilter[] | SCondition | QueryFilterFunction;
