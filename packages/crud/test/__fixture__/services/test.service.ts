import { Injectable } from '@nestjs/common';

import { CreateManyDto, CrudRequest } from '@ihelpee/crud';
import { CrudService } from '@ihelpee/crud';

@Injectable()
export class TestService<T> extends CrudService<T> {
  async getMany(req: CrudRequest): Promise<any> {
    return { req };
  }
  async getOne(req: CrudRequest): Promise<any> {
    return { req };
  }
  async createOne(req: CrudRequest, dto: T): Promise<any> {
    return { req, dto };
  }
  async createMany(req: CrudRequest, dto: CreateManyDto<T>): Promise<any> {
    return { req, dto };
  }
  async updateOne(req: CrudRequest, dto: T): Promise<any> {
    return { req, dto };
  }
  async replaceOne(req: CrudRequest, dto: T): Promise<any> {
    return { req, dto };
  }
  async deleteOne(req: CrudRequest): Promise<any> {
    return { req };
  }
  async recoverOne(req: CrudRequest): Promise<any> {
    return { req };
  }
  decidePagination(): boolean {
    return true;
  }
}
