import { TypeOrmCrudService } from '../../../crud-typeorm/src/typeorm-crud.service';
import { Device } from '../../../../integration/crud-typeorm/devices';
export declare class DevicesService extends TypeOrmCrudService<Device> {
    constructor(repo: any);
}
