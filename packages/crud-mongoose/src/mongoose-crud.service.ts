import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { Model, FilterQuery, Document, UpdateQuery } from 'mongoose';
import {
  CreateManyDto,
  CrudRequest,
  CrudRequestOptions,
  CrudService,
  GetManyDefaultResponse,
  QueryOptions,
} from '@ihelpee/crud';
import { ParsedRequestParams, QueryFilter } from '@ihelpee/crud-request';

@Injectable()
export class MongooseCrudService<T> extends CrudService<T> {
  constructor(protected readonly model: Model<T>) {
    super();
  }

  async getMany(req: CrudRequest): Promise<GetManyDefaultResponse<T> | T[]> {
    const { parsed, options } = req;
    const filterQuery = this.buildFilterQuery(parsed);
    const take = this.getTake(parsed, options.query);
    const skip = this.getSkip(parsed, take);
    const sort = this.buildSort(parsed);
    const select = this.buildSelect(parsed);

    const query = this.model.find(filterQuery);

    if (select) {
      query.select(select);
    }
    if (sort) {
      query.sort(sort);
    }
    if (skip) {
      query.skip(skip);
    }
    if (take) {
      query.limit(take);
    }

    if (this.decidePagination(parsed, options)) {
      const [data, total] = await Promise.all([
        query.exec(),
        this.model.countDocuments(filterQuery).exec(),
      ]);

      return this.createPageInfo(data as any, total, take, skip || 0);
    }

    const data = await query.exec();
    return data as any;
  }

  async getOne(req: CrudRequest): Promise<T> {
    const { parsed, options } = req;
    const filterQuery = this.buildFilterQuery(parsed);
    const select = this.buildSelect(parsed);

    const query = this.model.findOne(filterQuery);
    if (select) {
      query.select(select);
    }

    const doc = await query.exec();
    if (!doc) {
      this.throwNotFoundException(this.model.modelName);
    }

    return doc as any;
  }

  async createOne(req: CrudRequest, dto: T): Promise<T> {
    const created = new this.model(dto);
    const saved = await created.save();
    return saved as any;
  }

  async createMany(req: CrudRequest, dto: CreateManyDto<T>): Promise<T[]> {
    const created = await this.model.insertMany(dto.bulk);
    return created as any;
  }

  async updateOne(req: CrudRequest, dto: T): Promise<T> {
    const { parsed } = req;
    const filterQuery = this.buildFilterQuery(parsed);
    const updated = await this.model
      .findOneAndUpdate(filterQuery, dto as UpdateQuery<T>, { new: true })
      .exec();

    if (!updated) {
      this.throwNotFoundException(this.model.modelName);
    }
    return updated as any;
  }

  async replaceOne(req: CrudRequest, dto: T): Promise<T> {
    const { parsed } = req;
    const filterQuery = this.buildFilterQuery(parsed);
    const replaced = await this.model
      .findOneAndReplace(filterQuery, dto, { new: true })
      .exec();

    if (!replaced) {
      this.throwNotFoundException(this.model.modelName);
    }
    return replaced as any;
  }

  async deleteOne(req: CrudRequest): Promise<void | T> {
    const { parsed } = req;
    const filterQuery = this.buildFilterQuery(parsed);
    const deleted = await this.model.findOneAndDelete(filterQuery).exec();
    if (!deleted) {
      this.throwNotFoundException(this.model.modelName);
    }
    return deleted as any;
  }

  async recoverOne(req: CrudRequest): Promise<void | T> {
    // Requires mongoose-delete or similar plugin for soft deletes
    this.throwBadRequestException(
      'Recover is not implemented out of the box for Mongoose',
    );
  }

  protected buildFilterQuery(parsed: ParsedRequestParams): FilterQuery<T> {
    let filterQuery: FilterQuery<T> = {};

    if (parsed.search) {
      filterQuery = this.parseSearch(parsed.search);
    }

    if (parsed.filter && parsed.filter.length) {
      const filters = parsed.filter.map((f) => this.mapFilter(f));
      if (filters.length > 0) {
        filterQuery = { ...filterQuery, $and: filters };
      }
    }

    if (parsed.paramsFilter && parsed.paramsFilter.length) {
      parsed.paramsFilter.forEach((f) => {
        Object.assign(filterQuery, this.mapFilter(f));
      });
    }

    if (parsed.or && parsed.or.length) {
      const orFilters = parsed.or.map((f) => this.mapFilter(f));
      if (orFilters.length > 0) {
        filterQuery = { ...filterQuery, $or: orFilters };
      }
    }

    return filterQuery;
  }

  protected parseSearch(search: any): FilterQuery<T> {
    if (!search || typeof search !== 'object') {
      return {};
    }

    const result: any = {};

    for (const key of Object.keys(search)) {
      if (key === '$and' || key === '$or') {
        result[key] = search[key].map((s: any) => this.parseSearch(s));
      } else {
        const field = key;
        const fieldValue = search[key];

        if (typeof fieldValue === 'object' && fieldValue !== null) {
          const operator = Object.keys(fieldValue)[0];
          const val = fieldValue[operator];

          Object.assign(
            result,
            this.mapFilter({ field, operator, value: val } as QueryFilter),
          );
        } else {
          result[field] = { $eq: fieldValue };
        }
      }
    }

    return result as FilterQuery<T>;
  }

  protected mapFilter(filter: QueryFilter): FilterQuery<T> {
    const { field, operator, value } = filter;
    let actualField = field;
    if (field === 'id') {
      actualField = '_id';
    }

    switch (operator) {
      case 'eq':
        return { [actualField]: { $eq: value } } as any;
      case 'ne':
        return { [actualField]: { $ne: value } } as any;
      case 'gt':
        return { [actualField]: { $gt: value } } as any;
      case 'lt':
        return { [actualField]: { $lt: value } } as any;
      case 'gte':
        return { [actualField]: { $gte: value } } as any;
      case 'lte':
        return { [actualField]: { $lte: value } } as any;
      case 'in':
        return { [actualField]: { $in: value } } as any;
      case 'notin':
        return { [actualField]: { $nin: value } } as any;
      case 'isnull':
        return { [actualField]: { $eq: null } } as any;
      case 'notnull':
        return { [actualField]: { $ne: null } } as any;
      case 'between':
        return { [actualField]: { $gte: value[0], $lte: value[1] } } as any;
      case 'starts':
        return { [actualField]: { $regex: new RegExp(`^${value}`, 'i') } } as any;
      case 'ends':
        return { [actualField]: { $regex: new RegExp(`${value}$`, 'i') } } as any;
      case 'cont':
        return { [actualField]: { $regex: new RegExp(value, 'i') } } as any;
      case 'excl':
        return { [actualField]: { $not: { $regex: new RegExp(value, 'i') } } } as any;
      default:
        return { [actualField]: { $eq: value } } as any;
    }
  }

  protected buildSort(parsed: ParsedRequestParams): Record<string, 1 | -1> {
    const sort: Record<string, 1 | -1> = {};
    if (parsed.sort && parsed.sort.length) {
      parsed.sort.forEach((s) => {
        const field = s.field === 'id' ? '_id' : s.field;
        sort[field] = s.order === 'ASC' ? 1 : -1;
      });
    }
    return sort;
  }

  protected buildSelect(parsed: ParsedRequestParams): string {
    if (parsed.fields && parsed.fields.length) {
      return parsed.fields.map((f) => (f === 'id' ? '_id' : f)).join(' ');
    }
    return '';
  }
}
