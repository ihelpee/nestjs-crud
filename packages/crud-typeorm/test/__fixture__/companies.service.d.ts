import { TypeOrmCrudService } from '../../../crud-typeorm/src/typeorm-crud.service';
import { Company } from '../../../../integration/crud-typeorm/companies';
export declare class CompaniesService extends TypeOrmCrudService<Company> {
    constructor(repo: any);
}
